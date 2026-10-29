from datetime import date, datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.vaccine import Vaccine, VaccinationRecord
from app.models.patient import Patient
from app.models.user import User
from app.schemas.vaccine import (
    VaccineOut, VaccineCreate, VaccineUpdate,
    VaccinationRecordOut, VaccinationRecordCreate, VaccinationRecordUpdate
)
from app.api.deps import require_admin, require_worker_or_admin, require_any_staff, record_audit

router = APIRouter(prefix="/vaccines", tags=["Vaccination Management"])


# ==================== VACCINE CATALOGUE ====================

@router.get("/catalog", response_model=List[VaccineOut])
def get_vaccine_catalog(
    is_active: Optional[bool] = Query(True),
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """Retrieve national immunization schedule vaccine catalogue."""
    query = db.query(Vaccine)
    if is_active is not None:
        query = query.filter(Vaccine.is_active == is_active)
    return query.order_by(Vaccine.recommended_age_days.asc(), Vaccine.code.asc()).all()


@router.post("/catalog", response_model=VaccineOut, status_code=status.HTTP_201_CREATED)
def add_catalog_vaccine(
    vaccine_in: VaccineCreate,
    request: Request,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Add new vaccine entry into catalogue (Administrator only)."""
    existing = db.query(Vaccine).filter(Vaccine.code == vaccine_in.code.upper().strip()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vaccine code already exists in catalog")

    vaccine = Vaccine(
        code=vaccine_in.code.upper().strip(),
        name=vaccine_in.name.strip(),
        target_disease=vaccine_in.target_disease.strip(),
        standard_doses=vaccine_in.standard_doses,
        recommended_age_days=vaccine_in.recommended_age_days,
        description=vaccine_in.description,
        is_active=vaccine_in.is_active
    )
    db.add(vaccine)
    db.commit()
    db.refresh(vaccine)

    record_audit(
        db=db,
        user_id=current_admin.id,
        action="VACCINE_CATALOG_ADDED",
        entity_type="Vaccine",
        entity_id=str(vaccine.id),
        details=f"Added vaccine {vaccine.code} to catalogue",
        ip_address=request.client.host if request.client else None
    )

    return vaccine


@router.put("/catalog/{vaccine_id}", response_model=VaccineOut)
def update_catalog_vaccine(
    vaccine_id: int,
    vaccine_in: VaccineUpdate,
    request: Request,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update vaccine in catalogue (Administrator only)."""
    vaccine = db.query(Vaccine).filter(Vaccine.id == vaccine_id).first()
    if not vaccine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaccine not found in catalogue")

    update_data = vaccine_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        if field == "code" and val:
            val = val.upper().strip()
        setattr(vaccine, field, val)

    db.commit()
    db.refresh(vaccine)

    record_audit(
        db=db,
        user_id=current_admin.id,
        action="VACCINE_CATALOG_UPDATED",
        entity_type="Vaccine",
        entity_id=str(vaccine.id),
        details=f"Updated vaccine {vaccine.code}",
        ip_address=request.client.host if request.client else None
    )

    return vaccine


# ==================== VACCINATION RECORDS ====================

@router.get("/records", response_model=List[VaccinationRecordOut])
def list_vaccination_records(
    patient_id: Optional[int] = Query(None),
    vaccine_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),  # "Scheduled", "Completed", "Overdue", "Cancelled"
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """List and filter vaccination administration records."""
    query = db.query(VaccinationRecord)
    
    if patient_id:
        query = query.filter(VaccinationRecord.patient_id == patient_id)
    if vaccine_id:
        query = query.filter(VaccinationRecord.vaccine_id == vaccine_id)
    if status:
        query = query.filter(VaccinationRecord.status == status)
    if from_date:
        query = query.filter(VaccinationRecord.scheduled_date >= from_date)
    if to_date:
        query = query.filter(VaccinationRecord.scheduled_date <= to_date)

    return query.order_by(VaccinationRecord.scheduled_date.asc()).all()


@router.post("/records", response_model=VaccinationRecordOut, status_code=status.HTTP_201_CREATED)
def create_vaccination_record(
    record_in: VaccinationRecordCreate,
    request: Request,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db)
):
    """Record vaccination dose or schedule future dose."""
    # Validate patient exists
    patient = db.query(Patient).filter(Patient.id == record_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    # Validate vaccine exists
    vaccine = db.query(Vaccine).filter(Vaccine.id == record_in.vaccine_id).first()
    if not vaccine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaccine not found in catalogue")

    # Validate against duplicate entries
    duplicate = db.query(VaccinationRecord).filter(
        VaccinationRecord.patient_id == record_in.patient_id,
        VaccinationRecord.vaccine_id == record_in.vaccine_id,
        VaccinationRecord.dose_number == record_in.dose_number,
        VaccinationRecord.status != "Cancelled"
    ).first()
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dose {record_in.dose_number} for {vaccine.code} is already registered (Status: {duplicate.status})"
        )

    # Set worker if completing
    worker_id = record_in.administered_by_worker_id or current_user.id
    admin_date = record_in.administration_date
    if record_in.status == "Completed" and not admin_date:
        admin_date = date.today()

    record = VaccinationRecord(
        patient_id=record_in.patient_id,
        vaccine_id=record_in.vaccine_id,
        dose_number=record_in.dose_number,
        status=record_in.status,
        scheduled_date=record_in.scheduled_date,
        administration_date=admin_date,
        next_dose_date=record_in.next_dose_date,
        administered_by_worker_id=worker_id if record_in.status == "Completed" else None,
        batch_number=record_in.batch_number,
        notes=record_in.notes
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    record_audit(
        db=db,
        user_id=current_user.id,
        action="VACCINATION_RECORDED",
        entity_type="VaccinationRecord",
        entity_id=str(record.id),
        details=f"Recorded {vaccine.code} Dose {record.dose_number} for patient {patient.public_id} (Status: {record.status})",
        ip_address=request.client.host if request.client else None
    )

    return record


@router.put("/records/{record_id}", response_model=VaccinationRecordOut)
def update_vaccination_record(
    record_id: int,
    record_in: VaccinationRecordUpdate,
    request: Request,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db)
):
    """Update vaccination record (e.g. mark Completed, reschedule, add batch number)."""
    record = db.query(VaccinationRecord).filter(VaccinationRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaccination record not found")

    update_data = record_in.model_dump(exclude_unset=True)
    if "status" in update_data and update_data["status"] == "Completed":
        if not update_data.get("administration_date") and not record.administration_date:
            record.administration_date = date.today()
        if not record.administered_by_worker_id:
            record.administered_by_worker_id = current_user.id

    for field, val in update_data.items():
        setattr(record, field, val)

    db.commit()
    db.refresh(record)

    record_audit(
        db=db,
        user_id=current_user.id,
        action="VACCINATION_UPDATED",
        entity_type="VaccinationRecord",
        entity_id=str(record.id),
        details=f"Updated vaccination record {record.id} status to {record.status}",
        ip_address=request.client.host if request.client else None
    )

    return record

