from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserOut


class DiseaseCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    default_follow_up_days: int = 7
    is_active: bool = True


class DiseaseCategoryCreate(DiseaseCategoryBase):
    pass


class DiseaseCategoryOut(DiseaseCategoryBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DiseaseRecordBase(BaseModel):
    patient_id: int
    category_id: int
    clinical_status: str = "Suspected"  # "Suspected", "Confirmed"
    workflow_status: str = "Under Review"  # "Under Review", "Follow-up Required", "Referred", "Monitoring", "Closed"
    reported_date: date
    responsible_worker_id: Optional[int] = None
    symptoms_notes: Optional[str] = None
    referral_facility: Optional[str] = None
    follow_up_due_date: Optional[date] = None
    resolution_notes: Optional[str] = None


class DiseaseRecordCreate(DiseaseRecordBase):
    pass


class DiseaseRecordUpdate(BaseModel):
    clinical_status: Optional[str] = None
    workflow_status: Optional[str] = None
    responsible_worker_id: Optional[int] = None
    symptoms_notes: Optional[str] = None
    referral_facility: Optional[str] = None
    follow_up_due_date: Optional[date] = None
    resolution_notes: Optional[str] = None


class DiseaseRecordOut(DiseaseRecordBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[DiseaseCategoryOut] = None
    responsible_worker: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

