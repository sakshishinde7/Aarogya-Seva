from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Vaccine(Base):
    __tablename__ = "vaccines"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    target_disease = Column(String(200), nullable=False)
    standard_doses = Column(Integer, default=1, nullable=False)
    recommended_age_days = Column(Integer, default=0, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    records = relationship("VaccinationRecord", back_populates="vaccine")


class VaccinationRecord(Base):
    __tablename__ = "vaccination_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    vaccine_id = Column(Integer, ForeignKey("vaccines.id"), nullable=False, index=True)
    dose_number = Column(Integer, default=1, nullable=False)
    status = Column(String(30), default="Scheduled", nullable=False, index=True)  # "Scheduled", "Completed", "Overdue", "Cancelled"
    scheduled_date = Column(Date, nullable=False, index=True)
    administration_date = Column(Date, nullable=True)
    next_dose_date = Column(Date, nullable=True)
    administered_by_worker_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    batch_number = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="vaccination_records")
    vaccine = relationship("Vaccine", back_populates="records")
    administered_by = relationship("User")

