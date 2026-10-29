from datetime import date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.disease import DiseaseCategory, DiseaseRecord
from app.models.patient import Patient
from app.models.user import User
from app.schemas.disease import (
    DiseaseCategoryOut, DiseaseCategoryCreate,
    DiseaseRecordOut, DiseaseRecordCreate, DiseaseRecordUpdate
)
from app.api.deps import require_admin, require_worker_or_admin, require_any_staff, record_audit

router = APIRouter(prefix="/diseases", tags=["Disease Management"])


# ==================== CATEGORIES ====================

@router.get("/categories", response_model=List[DiseaseCategoryOut])
def list_categories(
    is_active: Optional[bool] = Query(True),
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """List disease surveillance categories."""
    query = db.query(DiseaseCategory)
    if is_active is not None:
        query = query.filter(DiseaseCategory.is_active == is_active)
    return query.order_by(DiseaseCategory.name.asc()).all()


@router.post("/categories", response_model=DiseaseCategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: DiseaseCategoryCreate,
    request: Request,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Add a new disease surveillance category (Administrator only)."""
    existing = db.query(DiseaseCategory).filter(DiseaseCategory.name == cat_in.name.strip()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category already exists")

    category = DiseaseCategory(
        name=cat_in.name.strip(),
        description=cat_in.description,
        default_follow_up_days=cat_in.default_follow_up_days,
        is_active=cat_in.is_active
    )
    db.add(category)
    db.commit()
    db.refresh(category)

    record_audit(
        db=db,
        user_id=current_admin.id,
        action="DISEASE_CATEGORY_CREATED",
        entity_type="DiseaseCategory",
        entity_id=str(category.id),
        details=f"Created surveillance category {category.name}",
        ip_address=request.client.host if request.client else None
    )

    return category


# ==================== DISEASE RECORDS ====================

@router.get("/records", response_model=List[DiseaseRecordOut])
def list_disease_records(
    patient_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    clinical_status: Optional[str] = Query(None),
    workflow_status: Optional[str] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """List and filter disease surveillance cases."""
    query = db.query(DiseaseRecord)
    
    if patient_id:
        query = query.filter(DiseaseRecord.patient_id == patient_id)
    if category_id:
        query = query.filter(DiseaseRecord.category_id == category_id)
    if clinical_status:
        query = query.filter(DiseaseRecord.clinical_status == clinical_status)
    if workflow_status:
        query = query.filter(DiseaseRecord.workflow_status == workflow_status)
    if from_date:
        query = query.filter(DiseaseRecord.reported_date >= from_date)
    if to_date:
        query = query.filter(DiseaseRecord.reported_date <= to_date)

    return query.order_by(DiseaseRecord.reported_date.desc()).all()


@router.post("/records", response_model=DiseaseRecordOut, status_code=status.HTTP_201_CREATED)
def report_disease_case(
    record_in: DiseaseRecordCreate,
    request: Request,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db)
):
    """Register a new disease surveillance record."""
    patient = db.query(Patient).filter(Patient.id == record_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    category = db.query(DiseaseCategory).filter(DiseaseCategory.id == record_in.category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Disease category not found")

    worker_id = record_in.responsible_worker_id or current_user.id

    record = DiseaseRecord(
        patient_id=record_in.patient_id,
        category_id=record_in.category_id,
        clinical_status=record_in.clinical_status,
        workflow_status=record_in.workflow_status,
        reported_date=record_in.reported_date,
        responsible_worker_id=worker_id,
        symptoms_notes=record_in.symptoms_notes,
        referral_facility=record_in.referral_facility,
        follow_up_due_date=record_in.follow_up_due_date,
        resolution_notes=record_in.resolution_notes
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    record_audit(
        db=db,
        user_id=current_user.id,
        action="DISEASE_RECORD_CREATED",
        entity_type="DiseaseRecord",
        entity_id=str(record.id),
        details=f"Reported {record.clinical_status} {category.name} case for patient {patient.public_id} ({patient.full_name})",
        ip_address=request.client.host if request.client else None
    )

    return record


@router.put("/records/{record_id}", response_model=DiseaseRecordOut)
def update_disease_case(
    record_id: int,
    record_in: DiseaseRecordUpdate,
    request: Request,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db)
):
    """Update surveillance case workflow status, facility referral, or resolution notes."""
    record = db.query(DiseaseRecord).filter(DiseaseRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Disease record not found")

    update_data = record_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(record, field, val)

    db.commit()
    db.refresh(record)

    record_audit(
        db=db,
        user_id=current_user.id,
        action="DISEASE_RECORD_UPDATED",
        entity_type="DiseaseRecord",
        entity_id=str(record.id),
        details=f"Updated disease record {record.id} to workflow status {record.workflow_status}",
        ip_address=request.client.host if request.client else None
    )

    return record

