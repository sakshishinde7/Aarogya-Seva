from datetime import date, datetime, timedelta, timezone
from typing import Dict, List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from app.database import get_db
from app.models.patient import Patient
from app.models.vaccine import VaccinationRecord, Vaccine
from app.models.disease import DiseaseRecord, DiseaseCategory
from app.models.followup import FollowUp
from app.models.audit import AuditLog
from app.models.user import User
from app.schemas.dashboard import (
    DashboardStats, AgeGroupItem, MonthlyTrendItem,
    DiseaseCountItem, RecentActivityItem
)
from app.api.deps import require_any_staff

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """Calculate and return real database metrics for the staff dashboard."""
    today = date.today()
    first_of_month = date(today.year, today.month, 1)

    # 1. Total Patients & New Registrations
    total_patients = db.query(Patient).filter(Patient.is_active == True).count()
    new_patients_this_month = db.query(Patient).filter(
        Patient.is_active == True,
        Patient.created_at >= datetime(today.year, today.month, 1, tzinfo=timezone.utc)
    ).count()

    # 2. Vaccinations
    # Update overdue statuses on the fly
    overdue_vax = db.query(VaccinationRecord).filter(
        VaccinationRecord.status == "Scheduled",
        VaccinationRecord.scheduled_date < today
    ).all()
    if overdue_vax:
        for v in overdue_vax:
            v.status = "Overdue"
        db.commit()

    vaccinations_completed = db.query(VaccinationRecord).filter(VaccinationRecord.status == "Completed").count()
    vaccinations_upcoming = db.query(VaccinationRecord).filter(
        VaccinationRecord.status == "Scheduled",
        VaccinationRecord.scheduled_date >= today
    ).count()
    vaccinations_overdue = db.query(VaccinationRecord).filter(VaccinationRecord.status == "Overdue").count()

    # 3. Disease Cases
    open_disease_cases = db.query(DiseaseRecord).filter(
        DiseaseRecord.workflow_status.in_(["Under Review", "Follow-up Required", "Referred", "Monitoring"])
    ).count()

    # 4. Follow-Ups
    # Update overdue follow-ups
    overdue_fus = db.query(FollowUp).filter(
        FollowUp.status == "Pending",
        FollowUp.due_date < today
    ).all()
    if overdue_fus:
        for fu in overdue_fus:
            fu.status = "Overdue"
        db.commit()

    pending_followups = db.query(FollowUp).filter(FollowUp.status == "Pending").count()
    overdue_followups = db.query(FollowUp).filter(FollowUp.status == "Overdue").count()

    # 5. Age Distribution
    # Calculate age groups dynamically from date_of_birth
    patients = db.query(Patient.date_of_birth).filter(Patient.is_active == True).all()
    age_groups = {
        "0-5 yrs (Infant/Child)": 0,
        "6-17 yrs (School/Adolescent)": 0,
        "18-45 yrs (Adult/Maternal)": 0,
        "46-59 yrs (Middle Age)": 0,
        "60+ yrs (Elderly)": 0,
    }
    for (dob,) in patients:
        years = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        if years <= 5:
            age_groups["0-5 yrs (Infant/Child)"] += 1
        elif years <= 17:
            age_groups["6-17 yrs (School/Adolescent)"] += 1
        elif years <= 45:
            age_groups["18-45 yrs (Adult/Maternal)"] += 1
        elif years <= 59:
            age_groups["46-59 yrs (Middle Age)"] += 1
        else:
            age_groups["60+ yrs (Elderly)"] += 1

    age_distribution = [
        AgeGroupItem(group=grp, count=cnt)
        for grp, cnt in age_groups.items()
    ]

    # 6. Vaccination Trends (past 6 months)
    vaccination_trends: List[MonthlyTrendItem] = []
    for i in range(5, -1, -1):
        target_month_date = today - timedelta(days=i * 30)
        m_start = date(target_month_date.year, target_month_date.month, 1)
        if target_month_date.month == 12:
            m_end = date(target_month_date.year + 1, 1, 1)
        else:
            m_end = date(target_month_date.year, target_month_date.month + 1, 1)
        
        comp_count = db.query(VaccinationRecord).filter(
            VaccinationRecord.status == "Completed",
            VaccinationRecord.administration_date >= m_start,
            VaccinationRecord.administration_date < m_end
        ).count()

        sched_count = db.query(VaccinationRecord).filter(
            VaccinationRecord.status.in_(["Scheduled", "Overdue"]),
            VaccinationRecord.scheduled_date >= m_start,
            VaccinationRecord.scheduled_date < m_end
        ).count()

        vaccination_trends.append(
            MonthlyTrendItem(
                month=m_start.strftime("%b %Y"),
                completed=comp_count,
                scheduled=sched_count
            )
        )

    # 7. Disease Distribution
    categories = db.query(DiseaseCategory).all()
    disease_distribution: List[DiseaseCountItem] = []
    for cat in categories:
        records = db.query(DiseaseRecord).filter(DiseaseRecord.category_id == cat.id).all()
        suspected = sum(1 for r in records if r.clinical_status == "Suspected")
        confirmed = sum(1 for r in records if r.clinical_status == "Confirmed")
        disease_distribution.append(
            DiseaseCountItem(
                category=cat.name,
                count=len(records),
                suspected=suspected,
                confirmed=confirmed
            )
        )

    # 8. Follow-up Status Summary
    followups = db.query(FollowUp.status).all()
    fu_summary = {"Pending": 0, "Completed": 0, "Overdue": 0, "Cancelled": 0}
    for (st,) in followups:
        if st in fu_summary:
            fu_summary[st] += 1

    # 9. Recent Activity from Audit Logs
    recent_logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(7).all()
    recent_activities = [
        RecentActivityItem(
            id=log.id,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            details=log.details,
            timestamp=log.timestamp.strftime("%Y-%m-%d %H:%M UTC"),
            user_name=log.user.full_name if log.user else "System"
        )
        for log in recent_logs
    ]

    return DashboardStats(
        total_patients=total_patients,
        new_patients_this_month=new_patients_this_month,
        vaccinations_completed=vaccinations_completed,
        vaccinations_upcoming=vaccinations_upcoming,
        vaccinations_overdue=vaccinations_overdue,
        open_disease_cases=open_disease_cases,
        pending_followups=pending_followups,
        overdue_followups=overdue_followups,
        age_distribution=age_distribution,
        vaccination_trends=vaccination_trends,
        disease_distribution=disease_distribution,
        followup_status_summary=fu_summary,
        recent_activities=recent_activities
    )

