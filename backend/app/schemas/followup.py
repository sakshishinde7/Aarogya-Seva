from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserOut


class FollowUpBase(BaseModel):
    patient_id: int
    module_type: str  # "Child", "Maternal", "Elderly", "General", "Disease", "Vaccination"
    related_record_id: Optional[int] = None
    assigned_worker_id: Optional[int] = None
    due_date: date
    status: str = "Pending"  # "Pending", "Completed", "Overdue", "Cancelled"
    priority: str = "Medium"  # "Low", "Medium", "High", "Urgent"
    purpose: str
    notes: Optional[str] = None
    resolution_notes: Optional[str] = None


class FollowUpCreate(FollowUpBase):
    pass


class FollowUpUpdate(BaseModel):
    assigned_worker_id: Optional[int] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    purpose: Optional[str] = None
    notes: Optional[str] = None
    resolution_notes: Optional[str] = None


class FollowUpOut(FollowUpBase):
    id: int
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    assigned_worker: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

