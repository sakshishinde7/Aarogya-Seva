from datetime import date, datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.followup import FollowUp
from app.models.patient import Patient
from app.models.user import User
from app.schemas.followup import FollowUpOut, FollowUpCreate, FollowUpUpdate
from app.api.deps import require_worker_or_admin, require_any_staff, record_audit

router = APIRouter(prefix="/followups", tags=["Unified Follow-Ups"])


@router.get("", response_model=List[FollowUpOut])
def list_followups(
    patient_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),  # "Pending", "Completed", "Overdue", "Cancelled"
    module_type: Optional[str] = Query(None),
    assigned_worker_id: Optional[int] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """Retrieve and filter coordinated follow-up appointments."""
    query = db.query(FollowUp)
    
    # Check for items that became overdue
    today = date.today()
    overdue_items = db.query(FollowUp).filter(
        FollowUp.status == "Pending",
        FollowUp.due_date < today
    ).all()
    if overdue_items:
        for item in overdue_items:
            item.status = "Overdue"
        db.commit()

    if patient_id:
        query = query.filter(FollowUp.patient_id == patient_id)
    if status:
        query = query.filter(FollowUp.status == status)
    if module_type:
        query = query.filter(FollowUp.module_type == module_type)
    if assigned_worker_id:
        query = query.filter(FollowUp.assigned_worker_id == assigned_worker_id)
    if from_date:
        query = query.filter(FollowUp.due_date >= from_date)
    if to_date:
        query = query.filter(FollowUp.due_date <= to_date)

    return query.order_by(FollowUp.due_date.asc()).all()


@router.post("", response_model=FollowUpOut, status_code=status.HTTP_201_CREATED)
def create_followup(
    fu_in: FollowUpCreate,
    request: Request,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db)
):
    """Schedule a new patient follow-up."""
    patient = db.query(Patient).filter(Patient.id == fu_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    worker_id = fu_in.assigned_worker_id or current_user.id
    
    # Auto determine initial status
    initial_status = fu_in.status
    if initial_status == "Pending" and fu_in.due_date < date.today():
        initial_status = "Overdue"

    followup = FollowUp(
        patient_id=fu_in.patient_id,
        module_type=fu_in.module_type,
        related_record_id=fu_in.related_record_id,
        assigned_worker_id=worker_id,
        due_date=fu_in.due_date,
        status=initial_status,
        priority=fu_in.priority,
        purpose=fu_in.purpose,
        notes=fu_in.notes,
        resolution_notes=fu_in.resolution_notes
    )
    db.add(followup)
    db.commit()
    db.refresh(followup)

    record_audit(
        db=db,
        user_id=current_user.id,
        action="FOLLOWUP_SCHEDULED",
        entity_type="FollowUp",
        entity_id=str(followup.id),
        details=f"Scheduled {followup.module_type} follow-up for patient {patient.public_id} due on {followup.due_date}",
        ip_address=request.client.host if request.client else None
    )

    return followup


@router.put("/{followup_id}", response_model=FollowUpOut)
def update_followup(
    followup_id: int,
    fu_in: FollowUpUpdate,
    request: Request,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db)
):
    """Resolve, update, or reschedule a follow-up."""
    followup = db.query(FollowUp).filter(FollowUp.id == followup_id).first()
    if not followup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Follow-up not found")

    update_data = fu_in.model_dump(exclude_unset=True)
    if "status" in update_data and update_data["status"] == "Completed":
        followup.completed_at = datetime.now(timezone.utc)

    for field, val in update_data.items():
        setattr(followup, field, val)

    db.commit()
    db.refresh(followup)

    record_audit(
        db=db,
        user_id=current_user.id,
        action="FOLLOWUP_UPDATED",
        entity_type="FollowUp",
        entity_id=str(followup.id),
        details=f"Updated follow-up {followup.id} to status {followup.status}",
        ip_address=request.client.host if request.client else None
    )

    return followup

