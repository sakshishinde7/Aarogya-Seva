from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class DiseaseCategory(Base):
    __tablename__ = "disease_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)  # "Malaria", "Dengue", "Tuberculosis", "Leprosy", "Other"
    description = Column(Text, nullable=True)
    default_follow_up_days = Column(Integer, default=7, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    records = relationship("DiseaseRecord", back_populates="category")


class DiseaseRecord(Base):
    __tablename__ = "disease_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("disease_categories.id"), nullable=False, index=True)
    clinical_status = Column(String(50), default="Suspected", nullable=False, index=True)  # "Suspected", "Confirmed"
    workflow_status = Column(String(50), default="Under Review", nullable=False, index=True)  # "Under Review", "Follow-up Required", "Referred", "Monitoring", "Closed"
    reported_date = Column(Date, nullable=False, index=True)
    responsible_worker_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    symptoms_notes = Column(Text, nullable=True)
    referral_facility = Column(String(200), nullable=True)
    follow_up_due_date = Column(Date, nullable=True, index=True)
    resolution_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="disease_records")
    category = relationship("DiseaseCategory", back_populates="records")
    responsible_worker = relationship("User")

