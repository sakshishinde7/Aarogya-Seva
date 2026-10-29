from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    module_type = Column(String(50), nullable=False, index=True)  # "Child", "Maternal", "Elderly", "General", "Disease", "Vaccination"
    related_record_id = Column(Integer, nullable=True)
    assigned_worker_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    due_date = Column(Date, nullable=False, index=True)
    status = Column(String(50), default="Pending", nullable=False, index=True)  # "Pending", "Completed", "Overdue", "Cancelled"
    priority = Column(String(30), default="Medium", nullable=False)  # "Low", "Medium", "High", "Urgent"
    purpose = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="followups")
    assigned_worker = relationship("User", back_populates="assigned_followups")

