from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserOut


# Healthcare Visits
class HealthcareVisitBase(BaseModel):
    patient_id: int
    module_type: str  # "Child", "Maternal", "Elderly", "General"
    visit_date: date
    worker_id: Optional[int] = None
    symptoms: Optional[str] = None
    observations: Optional[str] = None
    vitals_summary: Optional[str] = None
    referral_facility: Optional[str] = None
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None


class HealthcareVisitCreate(HealthcareVisitBase):
    pass


class HealthcareVisitOut(HealthcareVisitBase):
    id: int
    created_at: datetime
    worker: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)


# Child Records
class ChildRecordBase(BaseModel):
    patient_id: int
    guardian_name: str
    guardian_relation: str
    birth_weight_kg: Optional[float] = None
    current_weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    head_circumference_cm: Optional[float] = None
    growth_status: str = "Normal"
    growth_observations: Optional[str] = None


class ChildRecordCreate(ChildRecordBase):
    pass


class ChildRecordUpdate(BaseModel):
    guardian_name: Optional[str] = None
    guardian_relation: Optional[str] = None
    birth_weight_kg: Optional[float] = None
    current_weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    head_circumference_cm: Optional[float] = None
    growth_status: Optional[str] = None
    growth_observations: Optional[str] = None


class ChildRecordOut(ChildRecordBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Maternal Records
class MaternalRecordBase(BaseModel):
    patient_id: int
    lmp_date: Optional[date] = None
    edd_date: Optional[date] = None
    gravidity: int = 1
    parity: int = 0
    high_risk_status: bool = False
    high_risk_notes: Optional[str] = None
    antenatal_visits_count: int = 0
    postnatal_visits_count: int = 0
    iron_folic_acid_distributed: bool = False
    tetanus_toxoid_status: str = "Pending"
    notes: Optional[str] = None


class MaternalRecordCreate(MaternalRecordBase):
    pass


class MaternalRecordUpdate(BaseModel):
    lmp_date: Optional[date] = None
    edd_date: Optional[date] = None
    gravidity: Optional[int] = None
    parity: Optional[int] = None
    high_risk_status: Optional[bool] = None
    high_risk_notes: Optional[str] = None
    antenatal_visits_count: Optional[int] = None
    postnatal_visits_count: Optional[int] = None
    iron_folic_acid_distributed: Optional[bool] = None
    tetanus_toxoid_status: Optional[str] = None
    notes: Optional[str] = None


class MaternalRecordOut(MaternalRecordBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Elderly Records
class ElderlyRecordBase(BaseModel):
    patient_id: int
    chronic_conditions: Optional[str] = None
    mobility_status: str = "Independent"
    authorized_medications_summary: Optional[str] = None
    emergency_support_plan: Optional[str] = None
    last_checkup_date: Optional[date] = None
    next_checkup_date: Optional[date] = None


class ElderlyRecordCreate(ElderlyRecordBase):
    pass


class ElderlyRecordUpdate(BaseModel):
    chronic_conditions: Optional[str] = None
    mobility_status: Optional[str] = None
    authorized_medications_summary: Optional[str] = None
    emergency_support_plan: Optional[str] = None
    last_checkup_date: Optional[date] = None
    next_checkup_date: Optional[date] = None


class ElderlyRecordOut(ElderlyRecordBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

