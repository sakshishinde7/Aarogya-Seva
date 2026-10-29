from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserOut


class VaccineBase(BaseModel):
    code: str
    name: str
    target_disease: str
    standard_doses: int = 1
    recommended_age_days: int = 0
    description: Optional[str] = None
    is_active: bool = True


class VaccineCreate(VaccineBase):
    pass


class VaccineUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    target_disease: Optional[str] = None
    standard_doses: Optional[int] = None
    recommended_age_days: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class VaccineOut(VaccineBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VaccinationRecordBase(BaseModel):
    patient_id: int
    vaccine_id: int
    dose_number: int = 1
    status: str = "Scheduled"  # "Scheduled", "Completed", "Overdue", "Cancelled"
    scheduled_date: date
    administration_date: Optional[date] = None
    next_dose_date: Optional[date] = None
    administered_by_worker_id: Optional[int] = None
    batch_number: Optional[str] = None
    notes: Optional[str] = None


class VaccinationRecordCreate(VaccinationRecordBase):
    pass


class VaccinationRecordUpdate(BaseModel):
    status: Optional[str] = None
    scheduled_date: Optional[date] = None
    administration_date: Optional[date] = None
    next_dose_date: Optional[date] = None
    administered_by_worker_id: Optional[int] = None
    batch_number: Optional[str] = None
    notes: Optional[str] = None


class VaccinationRecordOut(VaccinationRecordBase):
    id: int
    created_at: datetime
    updated_at: datetime
    vaccine: Optional[VaccineOut] = None
    administered_by: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)


class VaccinationScheduleItem(BaseModel):
    vaccine: VaccineOut
    records: List[VaccinationRecordOut]

