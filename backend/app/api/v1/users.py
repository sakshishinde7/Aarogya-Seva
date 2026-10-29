from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserCreate, UserUpdate
from app.security import hash_password
from app.api.deps import require_admin, record_audit

router = APIRouter(prefix="/users", tags=["Staff Management"])


@router.get("", response_model=List[UserOut])
def list_staff(
    search: Optional[str] = Query(None, description="Search by name, email, locality"),
    role: Optional[str] = Query(None, description="Filter by role: administrator, worker, supervisor"),
    is_active: Optional[bool] = Query(None),
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List staff accounts (Administrator only)."""
    query = db.query(User)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter((User.full_name.ilike(term)) | (User.email.ilike(term)) | (User.locality.ilike(term)))
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    return query.order_by(User.full_name.asc()).all()


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_staff(
    user_in: UserCreate,
    request: Request,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new staff account (Administrator only)."""
    existing = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A staff member with this email address already exists"
        )
    
    if len(user_in.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters"
        )

    user = User(
        email=user_in.email.lower().strip(),
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name.strip(),
        role=user_in.role.lower(),
        locality=user_in.locality,
        phone=user_in.phone,
        is_active=user_in.is_active
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    record_audit(
        db=db,
        user_id=current_admin.id,
        action="STAFF_CREATED",
        entity_type="User",
        entity_id=str(user.id),
        details=f"Created staff account {user.email} with role {user.role}",
        ip_address=request.client.host if request.client else None
    )

    return user


@router.get("/{user_id}", response_model=UserOut)
def get_staff_detail(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get staff account details (Administrator only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff account not found")
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_staff(
    user_id: int,
    user_in: UserUpdate,
    request: Request,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update staff details, role, or activation status (Administrator only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff account not found")

    # Prevent deactivating own account if only admin
    if user.id == current_admin.id and user_in.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own active administrator account"
        )

    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        user.hashed_password = hash_password(update_data.pop("password"))
    
    for field, val in update_data.items():
        if field == "email" and val:
            val = val.lower().strip()
        setattr(user, field, val)

    db.commit()
    db.refresh(user)

    record_audit(
        db=db,
        user_id=current_admin.id,
        action="STAFF_UPDATED",
        entity_type="User",
        entity_id=str(user.id),
        details=f"Updated staff account {user.email}",
        ip_address=request.client.host if request.client else None
    )

    return user

