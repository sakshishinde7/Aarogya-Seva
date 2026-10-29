import math
import random
import string
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.database import get_db
from app.models.patient import Patient
from app.models.user import User
from app.schemas.patient import PatientOut, PatientCreate, PatientUpdate, PatientListResponse
from app.schemas.healthcare import ChildRecordOut, MaternalRecordOut, ElderlyRecordOut, HealthcareVisitOut
from app.schemas.vaccine import VaccinationRecordOut
from app.schemas.disease import DiseaseRecordOut
from app.schemas.followup import FollowUpOut
from app.api.deps import require_worker_or_admin, require_any_staff, record_audit

router = APIRouter(prefix="/patients", tags=["Patient Registry"])


def generate_public_id(db: Session) -> str:
    """Generate a clean, professional unique patient ID like AS-PAT-10842."""
    for _ in range(10):
        random_num = random.randint(10000, 99999)
        candidate = f"AS-PAT-{random_num}"
        if not db.query(Patient).filter(Patient.public_id == candidate).first():
            return candidate
    # Fallback with alpha chars
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"AS-PAT-{suffix}"


@router.get("", response_model=PatientListResponse)
def list_patients(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by name, public ID, contact"),
    village: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    sex: Optional[str] = Query(None),
    assigned_worker_id: Optional[int] = Query(None),
    is_active: Optional[bool] = Query(True),
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """Search and paginate patient registry."""
    query = db.query(Patient)
    
    if is_active is not None:
        query = query.filter(Patient.is_active == is_active)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Patient.full_name.ilike(term),
                Patient.public_id.ilike(term),
                Patient.contact_number.ilike(term),
                Patient.village_locality.ilike(term)
            )
        )

    if village:
        query = query.filter(Patient.village_locality.ilike(f"%{village.strip()}%"))
    if district:
        query = query.filter(Patient.district.ilike(f"%{district.strip()}%"))
    if sex:
        query = query.filter(Patient.sex == sex)
    if assigned_worker_id:
        query = query.filter(Patient.assigned_worker_id == assigned_worker_id)

    total = query.count()
    pages = math.ceil(total / limit) if total > 0 else 1
    items = query.order_by(Patient.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return PatientListResponse(
        total=total,
        page=page,
        limit=limit,
        pages=pages,
        items=items
    )


@router.post("/check-duplicate")
def check_duplicate_patient(
    full_name: str = Query(...),
    date_of_birth: str = Query(...),
    village_locality: str = Query(...),
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """Check if a similar patient already exists to prevent duplicate entries."""
    matches = db.query(Patient).filter(
        Patient.full_name.ilike(full_name.strip()),
        Patient.date_of_birth == date_of_birth,
        Patient.village_locality.ilike(village_locality.strip()),
        Patient.is_active == True
    ).all()
    return {
        "has_potential_duplicate": len(matches) > 0,
        "matches": [
            {
                "id": m.id,
                "public_id": m.public_id,
                "full_name": m.full_name,
                "village": m.village_locality,
                "created_at": m.created_at.isoformat()
            }
            for m in matches
        ]
    }


@router.post("", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: PatientCreate,
    request: Request,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db)
):
    """Register a new patient into the unified registry."""
    public_id = generate_public_id(db)

    # If worker is registering and assigned_worker_id is omitted, default to current worker
    assigned_id = patient_in.assigned_worker_id
    if not assigned_id and current_user.role == "worker":
        assigned_id = current_user.id

    patient = Patient(
        public_id=public_id,
        full_name=patient_in.full_name.strip(),
        date_of_birth=patient_in.date_of_birth,
        sex=patient_in.sex,
        village_locality=patient_in.village_locality.strip(),
        district=patient_in.district.strip(),
        state=patient_in.state.strip(),
        contact_number=patient_in.contact_number,
        emergency_contact_name=patient_in.emergency_contact_name,
        emergency_contact_phone=patient_in.emergency_contact_phone,
        emergency_contact_relation=patient_in.emergency_contact_relation,
        assigned_worker_id=assigned_id,
        notes=patient_in.notes,
        is_active=True
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    record_audit(
        db=db,
        user_id=current_user.id,
        action="PATIENT_REGISTERED",
        entity_type="Patient",
        entity_id=str(patient.id),
        details=f"Registered patient {patient.full_name} ({patient.public_id}) in {patient.village_locality}",
        ip_address=request.client.host if request.client else None
    )

    return patient


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(
    patient_id: int,
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """Retrieve patient record by ID."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient


@router.get("/{patient_id}/full-profile")
def get_patient_full_profile(
    patient_id: int,
    current_user: User = Depends(require_any_staff),
    db: Session = Depends(get_db)
):
    """Retrieve patient complete clinical and operational profile across all modules."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    return {
        "patient": PatientOut.model_validate(patient),
        "child_record": ChildRecordOut.model_validate(patient.child_record) if patient.child_record else None,
        "maternal_record": MaternalRecordOut.model_validate(patient.maternal_record) if patient.maternal_record else None,
        "elderly_record": ElderlyRecordOut.model_validate(patient.elderly_record) if patient.elderly_record else None,
        "recent_visits": [HealthcareVisitOut.model_validate(v) for v in sorted(patient.visits, key=lambda x: x.visit_date, reverse=True)[:5]],
        "vaccination_records": [VaccinationRecordOut.model_validate(vr) for vr in sorted(patient.vaccination_records, key=lambda x: x.scheduled_date)],
        "disease_records": [DiseaseRecordOut.model_validate(dr) for dr in sorted(patient.disease_records, key=lambda x: x.reported_date, reverse=True)],
        "followups": [FollowUpOut.model_validate(fu) for fu in sorted(patient.followups, key=lambda x: x.due_date, reverse=True)]
    }


@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(
    patient_id: int,
    patient_in: PatientUpdate,
    request: Request,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db)
):
    """Update patient details."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    update_data = patient_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        if isinstance(val, str):
            val = val.strip()
        setattr(patient, field, val)

    db.commit()
    db.refresh(patient)

    record_audit(
        db=db,
        user_id=current_user.id,
        action="PATIENT_UPDATED",
        entity_type="Patient",
        entity_id=str(patient.id),
        details=f"Updated patient details for {patient.public_id} ({patient.full_name})",
        ip_address=request.client.host if request.client else None
    )

    return patient


@router.delete("/{patient_id}")
def deactivate_patient(
    patient_id: int,
    request: Request,
    current_user: User = Depends(require_worker_or_admin),
    db: Session = Depends(get_db)
):
    """Soft-deactivate patient with safety audit log."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    patient.is_active = False
    db.commit()

    record_audit(
        db=db,
        user_id=current_user.id,
        action="PATIENT_DEACTIVATED",
        entity_type="Patient",
        entity_id=str(patient.id),
        details=f"Deactivated patient record {patient.public_id} ({patient.full_name})",
        ip_address=request.client.host if request.client else None
    )

    return {"message": f"Patient {patient.public_id} deactivated successfully"}

