from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserOut


class PatientBase(BaseModel):
    full_name: str
    date_of_birth: date
    sex: str  # "Male", "Female", "Other"
    village_locality: str
    district: str
    state: str = "Maharashtra"
    contact_number: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    assigned_worker_id: Optional[int] = None
    notes: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None
    village_locality: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    contact_number: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    assigned_worker_id: Optional[int] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class PatientOut(PatientBase):
    id: int
    public_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    age_years: int
    age_display: str
    assigned_worker: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)


class PatientListResponse(BaseModel):
    total: int
    page: int
    limit: int
    pages: int
    items: List[PatientOut]

