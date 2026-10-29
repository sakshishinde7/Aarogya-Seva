from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Date, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class HealthcareVisit(Base):
    __tablename__ = "healthcare_visits"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    module_type = Column(String(50), nullable=False, index=True)  # "Child", "Maternal", "Elderly", "General"
    visit_date = Column(Date, nullable=False, index=True)
    worker_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    symptoms = Column(Text, nullable=True)
    observations = Column(Text, nullable=True)
    vitals_summary = Column(String(200), nullable=True)  # e.g., "BP: 120/80 mmHg, SpO2: 98%, Pulse: 76 bpm"
    referral_facility = Column(String(200), nullable=True)
    follow_up_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="visits")
    worker = relationship("User")


class ChildRecord(Base):
    __tablename__ = "child_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    guardian_name = Column(String(150), nullable=False)
    guardian_relation = Column(String(50), nullable=False)  # "Mother", "Father", "Grandparent"
    birth_weight_kg = Column(Float, nullable=True)
    current_weight_kg = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    head_circumference_cm = Column(Float, nullable=True)
    growth_status = Column(String(50), default="Normal", nullable=False)  # "Normal", "Moderate Underweight", "Severe Underweight"
    growth_observations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="child_record")


class MaternalRecord(Base):
    __tablename__ = "maternal_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    lmp_date = Column(Date, nullable=True)  # Last Menstrual Period
    edd_date = Column(Date, nullable=True)  # Expected Delivery Date
    gravidity = Column(Integer, default=1, nullable=False)
    parity = Column(Integer, default=0, nullable=False)
    high_risk_status = Column(Boolean, default=False, nullable=False)
    high_risk_notes = Column(Text, nullable=True)
    antenatal_visits_count = Column(Integer, default=0, nullable=False)
    postnatal_visits_count = Column(Integer, default=0, nullable=False)
    iron_folic_acid_distributed = Column(Boolean, default=False, nullable=False)
    tetanus_toxoid_status = Column(String(50), default="Pending", nullable=False)  # "Pending", "1st Dose Given", "Complete"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="maternal_record")


class ElderlyRecord(Base):
    __tablename__ = "elderly_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    chronic_conditions = Column(Text, nullable=True)  # e.g., "Hypertension, Type 2 Diabetes"
    mobility_status = Column(String(50), default="Independent", nullable=False)  # "Independent", "Assisted", "Bedridden"
    authorized_medications_summary = Column(Text, nullable=True)  # Verified PHC prescription list summary
    emergency_support_plan = Column(Text, nullable=True)
    last_checkup_date = Column(Date, nullable=True)
    next_checkup_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="elderly_record")

