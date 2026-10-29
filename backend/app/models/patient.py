from datetime import datetime, date, timezone
from dateutil.relativedelta import relativedelta
from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String(32), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False, index=True)
    date_of_birth = Column(Date, nullable=False)
    sex = Column(String(20), nullable=False)  # "Male", "Female", "Other"
    village_locality = Column(String(150), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, default="Maharashtra")
    
    contact_number = Column(String(30), nullable=True)
    emergency_contact_name = Column(String(150), nullable=True)
    emergency_contact_phone = Column(String(30), nullable=True)
    emergency_contact_relation = Column(String(50), nullable=True)
    
    assigned_worker_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    assigned_worker = relationship("User", back_populates="assigned_patients")
    vaccination_records = relationship("VaccinationRecord", back_populates="patient", cascade="all, delete-orphan")
    visits = relationship("HealthcareVisit", back_populates="patient", cascade="all, delete-orphan")
    child_record = relationship("ChildRecord", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    maternal_record = relationship("MaternalRecord", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    elderly_record = relationship("ElderlyRecord", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    disease_records = relationship("DiseaseRecord", back_populates="patient", cascade="all, delete-orphan")
    followups = relationship("FollowUp", back_populates="patient", cascade="all, delete-orphan")

    @property
    def age_years(self) -> int:
        today = date.today()
        diff = relativedelta(today, self.date_of_birth)
        return diff.years

    @property
    def age_display(self) -> str:
        today = date.today()
        diff = relativedelta(today, self.date_of_birth)
        if diff.years == 0:
            return f"{diff.months}m {diff.days}d"
        elif diff.years < 5:
            return f"{diff.years}y {diff.months}m"
        else:
            return f"{diff.years}y"

