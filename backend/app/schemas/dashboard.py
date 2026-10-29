from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class MetricCard(BaseModel):
    label: str
    value: int
    change_text: Optional[str] = None
    trend: Optional[str] = None  # "up", "down", "neutral"


class AgeGroupItem(BaseModel):
    group: str
    count: int


class MonthlyTrendItem(BaseModel):
    month: str
    completed: int
    scheduled: int


class DiseaseCountItem(BaseModel):
    category: str
    count: int
    suspected: int
    confirmed: int


class RecentActivityItem(BaseModel):
    id: int
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    details: Optional[str] = None
    timestamp: str
    user_name: Optional[str] = None


class DashboardStats(BaseModel):
    total_patients: int
    new_patients_this_month: int
    vaccinations_completed: int
    vaccinations_upcoming: int
    vaccinations_overdue: int
    open_disease_cases: int
    pending_followups: int
    overdue_followups: int
    
    age_distribution: List[AgeGroupItem]
    vaccination_trends: List[MonthlyTrendItem]
    disease_distribution: List[DiseaseCountItem]
    followup_status_summary: Dict[str, int]
    recent_activities: List[RecentActivityItem]

