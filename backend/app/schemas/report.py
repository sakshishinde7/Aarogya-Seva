from typing import List, Optional
from pydantic import BaseModel


class LocalityReportItem(BaseModel):
    locality: str
    district: str
    count: int


class VaccinationReportItem(BaseModel):
    vaccine_code: str
    vaccine_name: str
    completed: int
    scheduled: int
    overdue: int
    cancelled: int
    total: int


class DiseaseReportItem(BaseModel):
    category_name: str
    suspected: int
    confirmed: int
    under_review: int
    followup_required: int
    referred: int
    monitoring: int
    closed: int
    total: int


class FollowUpReportItem(BaseModel):
    module_type: str
    pending: int
    completed: int
    overdue: int
    cancelled: int
    total: int


class ComprehensiveReport(BaseModel):
    total_patients: int
    total_vaccinations: int
    total_disease_cases: int
    total_followups: int
    localities: List[LocalityReportItem]
    vaccinations: List[VaccinationReportItem]
    diseases: List[DiseaseReportItem]
    followups: List[FollowUpReportItem]

