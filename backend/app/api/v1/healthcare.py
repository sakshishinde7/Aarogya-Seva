from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.healthcare import HealthcareVisit, ChildRecord, MaternalRecord, ElderlyRecord
from app.models.patient import Patient
from app.models.user import User
from app.schemas.healthcare import (
    HealthcareVisitOut, HealthcareVisitCreate,
    ChildRecordOut, ChildRecordCreate, ChildRecordUpdate,
    MaternalRecordOut, MaternalRecordCreate, MaternalRecordUpdate,
    ElderlyRecordOut, ElderlyRecordCreate, ElderlyRecordUpdate
)
from app.api.deps import require_worker_or_admin, require_any_staff, record_audit

router = APIRouter(prefix="/healthcare", tags=["Healthcare Modules"])


# ==================== GENERAL VISITS ====================

@router.get("/visits", response_model=List[HealthcareVisitOut])
def list_visits(
    patient_id: Optional[int] = Query(None),
    module_type: Optional[str] = Query(None),
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """List clinical consultations/visits across modules."""
    query = db.query(HealthcareVisit)
    if patient_id:
        query = query.filter(HealthcareVisit.patient_id == patient_id)
    if module_type:
        query = query.filter(HealthcareVisit.module_type == module_type)
    return query.order_by(HealthcareVisit.visit_date.desc()).all()


@router.post("/visits", response_model=HealthcareVisitOut, status_code=status.HTTP_201_CREATED)
def record_visit(
    visit_in: HealthcareVisitCreate,
    request: Request,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db)
):
    """Record a clinical encounter/visit."""
    patient = db.query(Patient).filter(Patient.id == visit_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    worker_id = visit_in.worker_id or current_user.id

    visit = HealthcareVisit(
        patient_id=visit_in.patient_id,
        module_type=visit_in.module_type,
        visit_date=visit_in.visit_date,
        worker_id=worker_id,
        symptoms=visit_in.symptoms,
        observations=visit_in.observations,
        vitals_summary=visit_in.vitals_summary,
        referral_facility=visit_in.referral_facility,
        follow_up_date=visit_in.follow_up_date,
        notes=visit_in.notes
    )
    db.add(visit)
    db.commit()
    db.refresh(visit)

    record_audit(
        db=db,
        user_id=current_user.id,
        action="HEALTHCARE_VISIT_RECORDED",
        entity_type="HealthcareVisit",
        entity_id=str(visit.id),
        details=f"Recorded {visit.module_type} visit for patient {patient.public_id}",
        ip_address=request.client.host if request.client else None
    )

    return visit


# ==================== CHILD HEALTHCARE ====================

@router.get("/child/{patient_id}", response_model=Optional[ChildRecordOut])
def get_child_record(
    patient_id: int,
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """Retrieve child developmental and growth record."""
    record = db.query(ChildRecord).filter(ChildRecord.patient_id == patient_id).first()
    return record


@router.post("/child", response_model=ChildRecordOut)
def upsert_child_record(
    record_in: ChildRecordCreate,
    request: Request,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db)
):
    """Create or update child healthcare record."""
    patient = db.query(Patient).filter(Patient.id == record_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    record = db.query(ChildRecord).filter(ChildRecord.patient_id == record_in.patient_id).first()
    if not record:
        record = ChildRecord(**record_in.model_dump())
        db.add(record)
        action = "CHILD_RECORD_CREATED"
    else:
        for field, val in record_in.model_dump(exclude_unset=True).items():
            setattr(record, field, val)
        action = "CHILD_RECORD_UPDATED"

    db.commit()
    db.refresh(record)

    record_audit(
        db=db,
        user_id=current_user.id,
        action=action,
        entity_type="ChildRecord",
        entity_id=str(record.id),
        details=f"Saved child record for {patient.public_id} ({patient.full_name})",
        ip_address=request.client.host if request.client else None
    )

    return record


# ==================== MATERNAL HEALTHCARE ====================

@router.get("/maternal/{patient_id}", response_model=Optional[MaternalRecordOut])
def get_maternal_record(
    patient_id: int,
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """Retrieve maternal healthcare record."""
    record = db.query(MaternalRecord).filter(MaternalRecord.patient_id == patient_id).first()
    return record


@router.post("/maternal", response_model=MaternalRecordOut)
def upsert_maternal_record(
    record_in: MaternalRecordCreate,
    request: Request,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db)
):
    """Create or update maternal healthcare record."""
    patient = db.query(Patient).filter(Patient.id == record_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    record = db.query(MaternalRecord).filter(MaternalRecord.patient_id == record_in.patient_id).first()
    if not record:
        record = MaternalRecord(**record_in.model_dump())
        db.add(record)
        action = "MATERNAL_RECORD_CREATED"
    else:
        for field, val in record_in.model_dump(exclude_unset=True).items():
            setattr(record, field, val)
        action = "MATERNAL_RECORD_UPDATED"

    db.commit()
    db.refresh(record)

    record_audit(
        db=db,
        user_id=current_user.id,
        action=action,
        entity_type="MaternalRecord",
        entity_id=str(record.id),
        details=f"Saved maternal record for {patient.public_id} ({patient.full_name})",
        ip_address=request.client.host if request.client else None
    )

    return record


# ==================== ELDERLY HEALTHCARE ====================

@router.get("/elderly/{patient_id}", response_model=Optional[ElderlyRecordOut])
def get_elderly_record(
    patient_id: int,
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """Retrieve elderly healthcare record."""
    record = db.query(ElderlyRecord).filter(ElderlyRecord.patient_id == patient_id).first()
    return record


@router.post("/elderly", response_model=ElderlyRecordOut)
def upsert_elderly_record(
    record_in: ElderlyRecordCreate,
    request: Request,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db)
):
    """Create or update elderly healthcare record."""
    patient = db.query(Patient).filter(Patient.id == record_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    record = db.query(ElderlyRecord).filter(ElderlyRecord.patient_id == record_in.patient_id).first()
    if not record:
        record = ElderlyRecord(**record_in.model_dump())
        db.add(record)
        action = "ELDERLY_RECORD_CREATED"
    else:
        for field, val in record_in.model_dump(exclude_unset=True).items():
            setattr(record, field, val)
        action = "ELDERLY_RECORD_UPDATED"

    db.commit()
    db.refresh(record)

    record_audit(
        db=db,
        user_id=current_user.id,
        action=action,
        entity_type="ElderlyRecord",
        entity_id=str(record.id),
        details=f"Saved elderly record for {patient.public_id} ({patient.full_name})",
        ip_address=request.client.host if request.client else None
    )

    return record

