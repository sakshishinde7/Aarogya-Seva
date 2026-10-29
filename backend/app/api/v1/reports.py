import csv
import io
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.patient import Patient
from app.models.vaccine import Vaccine, VaccinationRecord
from app.models.disease import DiseaseCategory, DiseaseRecord
from app.models.followup import FollowUp
from app.models.user import User
from app.schemas.report import (
    ComprehensiveReport, LocalityReportItem, VaccinationReportItem,
    DiseaseReportItem, FollowUpReportItem
)
from app.api.deps import require_any_staff, record_audit

router = APIRouter(prefix="/reports", tags=["Reporting and Analytics"])


def sanitize_csv_cell(value: Any) -> str:
    """Protect against spreadsheet formula injection (CWE-1236).
    Prefix characters =, +, -, @, or tab/return with an apostrophe.
    """
    if value is None:
        return ""
    text = str(value)
    if text and text[0] in ("=", "+", "-", "@", "\t", "\r"):
        return f"'{text}"
    return text


@router.get("/aggregate", response_model=ComprehensiveReport)
@router.get("/summary", response_model=ComprehensiveReport)
def get_aggregate_report(
    district: Optional[str] = Query(None),
    locality: Optional[str] = Query(None),
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """Generate aggregate healthcare delivery report from live database records."""
    # Patient query
    p_query = db.query(Patient).filter(Patient.is_active == True)
    if district:
        p_query = p_query.filter(Patient.district.ilike(f"%{district.strip()}%"))
    if locality:
        p_query = p_query.filter(Patient.village_locality.ilike(f"%{locality.strip()}%"))
    
    total_patients = p_query.count()

    # Locality breakdown
    locality_counts = db.query(
        Patient.village_locality,
        Patient.district,
        func.count(Patient.id).label("count")
    ).filter(Patient.is_active == True)
    if district:
        locality_counts = locality_counts.filter(Patient.district.ilike(f"%{district.strip()}%"))
    if locality:
        locality_counts = locality_counts.filter(Patient.village_locality.ilike(f"%{locality.strip()}%"))
    locality_counts = locality_counts.group_by(Patient.village_locality, Patient.district).order_by(func.count(Patient.id).desc()).all()

    localities = [
        LocalityReportItem(locality=loc, district=dist, count=cnt)
        for loc, dist, cnt in locality_counts
    ]

    # Vaccination summary
    vaccines = db.query(Vaccine).all()
    vaccination_items = []
    total_vaccinations = 0
    for v in vaccines:
        records = db.query(VaccinationRecord).filter(VaccinationRecord.vaccine_id == v.id).all()
        comp = sum(1 for r in records if r.status == "Completed")
        sched = sum(1 for r in records if r.status == "Scheduled")
        ovd = sum(1 for r in records if r.status == "Overdue")
        canc = sum(1 for r in records if r.status == "Cancelled")
        total = len(records)
        total_vaccinations += total
        vaccination_items.append(
            VaccinationReportItem(
                vaccine_code=v.code,
                vaccine_name=v.name,
                completed=comp,
                scheduled=sched,
                overdue=ovd,
                cancelled=canc,
                total=total
            )
        )

    # Disease breakdown
    categories = db.query(DiseaseCategory).all()
    disease_items = []
    total_disease_cases = 0
    for c in categories:
        records = db.query(DiseaseRecord).filter(DiseaseRecord.category_id == c.id).all()
        sus = sum(1 for r in records if r.clinical_status == "Suspected")
        conf = sum(1 for r in records if r.clinical_status == "Confirmed")
        ur = sum(1 for r in records if r.workflow_status == "Under Review")
        fr = sum(1 for r in records if r.workflow_status == "Follow-up Required")
        ref = sum(1 for r in records if r.workflow_status == "Referred")
        mon = sum(1 for r in records if r.workflow_status == "Monitoring")
        cls = sum(1 for r in records if r.workflow_status == "Closed")
        total = len(records)
        total_disease_cases += total
        disease_items.append(
            DiseaseReportItem(
                category_name=c.name,
                suspected=sus,
                confirmed=conf,
                under_review=ur,
                followup_required=fr,
                referred=ref,
                monitoring=mon,
                closed=cls,
                total=total
            )
        )

    # Follow-up breakdown
    module_types = ["Child", "Maternal", "Elderly", "General", "Disease", "Vaccination"]
    followup_items = []
    total_followups = 0
    for m in module_types:
        records = db.query(FollowUp).filter(FollowUp.module_type == m).all()
        pend = sum(1 for r in records if r.status == "Pending")
        comp = sum(1 for r in records if r.status == "Completed")
        ovd = sum(1 for r in records if r.status == "Overdue")
        canc = sum(1 for r in records if r.status == "Cancelled")
        total = len(records)
        total_followups += total
        followup_items.append(
            FollowUpReportItem(
                module_type=m,
                pending=pend,
                completed=comp,
                overdue=ovd,
                cancelled=canc,
                total=total
            )
        )

    return ComprehensiveReport(
        total_patients=total_patients,
        total_vaccinations=total_vaccinations,
        total_disease_cases=total_disease_cases,
        total_followups=total_followups,
        localities=localities,
        vaccinations=vaccination_items,
        diseases=disease_items,
        followups=followup_items
    )


@router.get("/export-csv")
@router.get("/export")
def export_csv_report(
    report_type: str = Query("aggregate", pattern="^(aggregate|patients|vaccinations|diseases|followups)$"),
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """Export sanitized CSV reports with formula injection protection."""
    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "aggregate":
        writer.writerow(["Aarogya Seva - Healthcare Coordination Aggregate Summary Report"])
        writer.writerow(["Section", "Item / Category", "Sub-type / Status", "Count"])
        
        # Patients
        total_patients = db.query(Patient).filter(Patient.is_active == True).count()
        writer.writerow(["Patients", "Total Active Patients", "Active Registry", sanitize_csv_cell(total_patients)])
        
        # Localities
        locs = db.query(Patient.village_locality, Patient.district, func.count(Patient.id)).filter(Patient.is_active == True).group_by(Patient.village_locality, Patient.district).all()
        for loc, dist, cnt in locs:
            writer.writerow(["Locality", sanitize_csv_cell(loc), sanitize_csv_cell(dist), sanitize_csv_cell(cnt)])

        # Vaccinations
        for v in db.query(Vaccine).all():
            recs = db.query(VaccinationRecord).filter(VaccinationRecord.vaccine_id == v.id).all()
            writer.writerow(["Vaccination", sanitize_csv_cell(v.code), "Completed", sanitize_csv_cell(sum(1 for r in recs if r.status == 'Completed'))])
            writer.writerow(["Vaccination", sanitize_csv_cell(v.code), "Scheduled", sanitize_csv_cell(sum(1 for r in recs if r.status == 'Scheduled'))])
            writer.writerow(["Vaccination", sanitize_csv_cell(v.code), "Overdue", sanitize_csv_cell(sum(1 for r in recs if r.status == 'Overdue'))])

    elif report_type == "patients":
        writer.writerow(["Patient ID", "Full Name", "Age", "Sex", "Locality", "District", "State", "Registration Date"])
        patients = db.query(Patient).filter(Patient.is_active == True).all()
        for p in patients:
            writer.writerow([
                sanitize_csv_cell(p.public_id),
                sanitize_csv_cell(p.full_name),
                sanitize_csv_cell(p.age_display),
                sanitize_csv_cell(p.sex),
                sanitize_csv_cell(p.village_locality),
                sanitize_csv_cell(p.district),
                sanitize_csv_cell(p.state),
                sanitize_csv_cell(p.created_at.strftime("%Y-%m-%d"))
            ])

    elif report_type == "vaccinations":
        writer.writerow(["Record ID", "Patient ID", "Vaccine Code", "Dose", "Status", "Scheduled Date", "Administered Date", "Batch Number"])
        records = db.query(VaccinationRecord).all()
        for r in records:
            writer.writerow([
                sanitize_csv_cell(r.id),
                sanitize_csv_cell(r.patient.public_id if r.patient else ""),
                sanitize_csv_cell(r.vaccine.code if r.vaccine else ""),
                sanitize_csv_cell(r.dose_number),
                sanitize_csv_cell(r.status),
                sanitize_csv_cell(r.scheduled_date),
                sanitize_csv_cell(r.administration_date),
                sanitize_csv_cell(r.batch_number)
            ])

    elif report_type == "diseases":
        writer.writerow(["Record ID", "Patient ID", "Category", "Clinical Status", "Workflow Status", "Reported Date", "Referral Facility"])
        records = db.query(DiseaseRecord).all()
        for r in records:
            writer.writerow([
                sanitize_csv_cell(r.id),
                sanitize_csv_cell(r.patient.public_id if r.patient else ""),
                sanitize_csv_cell(r.category.name if r.category else ""),
                sanitize_csv_cell(r.clinical_status),
                sanitize_csv_cell(r.workflow_status),
                sanitize_csv_cell(r.reported_date),
                sanitize_csv_cell(r.referral_facility)
            ])

    elif report_type == "followups":
        writer.writerow(["Follow-up ID", "Patient ID", "Module", "Purpose", "Due Date", "Status", "Priority"])
        records = db.query(FollowUp).all()
        for r in records:
            writer.writerow([
                sanitize_csv_cell(r.id),
                sanitize_csv_cell(r.patient.public_id if r.patient else ""),
                sanitize_csv_cell(r.module_type),
                sanitize_csv_cell(r.purpose),
                sanitize_csv_cell(r.due_date),
                sanitize_csv_cell(r.status),
                sanitize_csv_cell(r.priority)
            ])

    record_audit(
        db=db,
        user_id=current_user.id,
        action="EXPORT_CSV_REPORT",
        entity_type="Report",
        details=f"Exported {report_type} CSV report"
    )

    output.seek(0)
    filename = f"aarogya_seva_{report_type}_report.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

