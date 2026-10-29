from datetime import datetime, timezone
import time
from typing import Dict, Any
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.config import settings
from app.database import engine, Base
from app.api.v1.router import api_router

# In-memory simple rate limiting for login attempts
_LOGIN_ATTEMPTS: Dict[str, list] = {}
RATE_LIMIT_WINDOW_SECONDS = 60
MAX_LOGIN_ATTEMPTS = 15

# Initialize database tables on startup (if not already managed by alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Rural Healthcare Coordination & Shared Records Platform (Maharashtra Demonstration Prototype)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS middleware configuration
origins = settings.BACKEND_CORS_ORIGINS
if isinstance(origins, str):
    origins = [o.strip() for o in origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    """Enforce basic rate limiting on login endpoint and add security headers."""
    client_ip = request.client.host if request.client else "unknown"
    
    # Login rate limiting
    if request.url.path.endswith("/auth/login") and request.method == "POST":
        now = time.time()
        attempts = _LOGIN_ATTEMPTS.get(client_ip, [])
        # filter to recent window
        attempts = [t for t in attempts if now - t < RATE_LIMIT_WINDOW_SECONDS]
        if len(attempts) >= MAX_LOGIN_ATTEMPTS:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many login attempts. Please wait a minute before trying again."}
            )
        attempts.append(now)
        _LOGIN_ATTEMPTS[client_ip] = attempts

    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


@app.get("/api/health", tags=["System Health"])
def health_check():
    """Application live status check."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/ready", tags=["System Health"])
def readiness_check():
    """Readiness probe checking database connectivity without leaking credentials."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "service": settings.PROJECT_NAME,
            "database": "connected",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as exc:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "service": settings.PROJECT_NAME,
                "database": "disconnected",
                "error": "Database connectivity check failed"
            }
        )


# Mount versioned API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

