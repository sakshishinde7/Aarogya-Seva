from app.schemas.user import UserBase, UserCreate, UserUpdate, UserOut
from app.schemas.auth import LoginRequest, TokenResponse, ChangePasswordRequest
from app.schemas.patient import PatientBase, PatientCreate, PatientUpdate, PatientOut, PatientListResponse
from app.schemas.vaccine import (
    VaccineBase, VaccineCreate, VaccineUpdate, VaccineOut,
    VaccinationRecordBase, VaccinationRecordCreate, VaccinationRecordUpdate, VaccinationRecordOut
)
from app.schemas.healthcare import (
    HealthcareVisitBase, HealthcareVisitCreate, HealthcareVisitOut,
    ChildRecordBase, ChildRecordCreate, ChildRecordUpdate, ChildRecordOut,
    MaternalRecordBase, MaternalRecordCreate, MaternalRecordUpdate, MaternalRecordOut,
    ElderlyRecordBase, ElderlyRecordCreate, ElderlyRecordUpdate, ElderlyRecordOut
)
from app.schemas.disease import (
    DiseaseCategoryBase, DiseaseCategoryCreate, DiseaseCategoryOut,
    DiseaseRecordBase, DiseaseRecordCreate, DiseaseRecordUpdate, DiseaseRecordOut
)
from app.schemas.followup import FollowUpBase, FollowUpCreate, FollowUpUpdate, FollowUpOut
from app.schemas.dashboard import DashboardStats
from app.schemas.report import ComprehensiveReport

__all__ = [
    "UserBase", "UserCreate", "UserUpdate", "UserOut",
    "LoginRequest", "TokenResponse", "ChangePasswordRequest",
    "PatientBase", "PatientCreate", "PatientUpdate", "PatientOut", "PatientListResponse",
    "VaccineBase", "VaccineCreate", "VaccineUpdate", "VaccineOut",
    "VaccinationRecordBase", "VaccinationRecordCreate", "VaccinationRecordUpdate", "VaccinationRecordOut",
    "HealthcareVisitBase", "HealthcareVisitCreate", "HealthcareVisitOut",
    "ChildRecordBase", "ChildRecordCreate", "ChildRecordUpdate", "ChildRecordOut",
    "MaternalRecordBase", "MaternalRecordCreate", "MaternalRecordUpdate", "MaternalRecordOut",
    "ElderlyRecordBase", "ElderlyRecordCreate", "ElderlyRecordUpdate", "ElderlyRecordOut",
    "DiseaseCategoryBase", "DiseaseCategoryCreate", "DiseaseCategoryOut",
    "DiseaseRecordBase", "DiseaseRecordCreate", "DiseaseRecordUpdate", "DiseaseRecordOut",
    "FollowUpBase", "FollowUpCreate", "FollowUpUpdate", "FollowUpOut",
    "DashboardStats",
    "ComprehensiveReport",
]

