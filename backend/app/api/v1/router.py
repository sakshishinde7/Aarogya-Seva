from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.patients import router as patients_router
from app.api.v1.vaccines import router as vaccines_router
from app.api.v1.healthcare import router as healthcare_router
from app.api.v1.diseases import router as diseases_router
from app.api.v1.followups import router as followups_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.reports import router as reports_router
from app.api.v1.audit import router as audit_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(patients_router)
api_router.include_router(vaccines_router)
api_router.include_router(healthcare_router)
api_router.include_router(diseases_router)
api_router.include_router(followups_router)
api_router.include_router(dashboard_router)
api_router.include_router(reports_router)
api_router.include_router(audit_router)

