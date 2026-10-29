import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.vaccine import Vaccine
from app.models.disease import DiseaseCategory
from app.security import hash_password, create_access_token

# In-memory SQLite database for test isolation
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_users(db_session):
    admin = User(
        email="test.admin@aarogyaseva.org",
        hashed_password=hash_password("AdminTestPass123!"),
        full_name="Dr. Test Admin",
        role="administrator",
        locality="Satara DHO",
        is_active=True,
    )
    worker = User(
        email="test.worker@aarogyaseva.org",
        hashed_password=hash_password("WorkerTestPass123!"),
        full_name="Anita Worker",
        role="worker",
        locality="Wai PHC",
        is_active=True,
    )
    supervisor = User(
        email="test.supervisor@aarogyaseva.org",
        hashed_password=hash_password("SupervisorTestPass123!"),
        full_name="Dr. Test Supervisor",
        role="supervisor",
        locality="Karad Sub-District",
        is_active=True,
    )
    inactive_user = User(
        email="test.inactive@aarogyaseva.org",
        hashed_password=hash_password("InactivePass123!"),
        full_name="Deactivated Staff",
        role="worker",
        is_active=False,
    )
    db_session.add_all([admin, worker, supervisor, inactive_user])
    db_session.commit()
    db_session.refresh(admin)
    db_session.refresh(worker)
    db_session.refresh(supervisor)
    db_session.refresh(inactive_user)

    return {
        "admin": admin,
        "worker": worker,
        "supervisor": supervisor,
        "inactive": inactive_user,
    }


@pytest.fixture
def auth_headers(test_users):
    def _get_headers(user_type="admin"):
        user = test_users[user_type]
        token = create_access_token(
            subject=str(user.id),
            role=user.role,
            email=user.email,
        )
        return {"Authorization": f"Bearer {token}"}

    return _get_headers


@pytest.fixture
def seed_catalog(db_session):
    vaccine = Vaccine(
        code="BCG",
        name="Bacillus Calmette-Guérin",
        target_disease="Tuberculosis",
        standard_doses=1,
        recommended_age_days=0,
        description="Birth dose",
        is_active=True,
    )
    category = DiseaseCategory(
        name="Vector-Borne Diseases",
        description="Dengue, Malaria, etc.",
        default_follow_up_days=7,
        is_active=True,
    )
    db_session.add(vaccine)
    db_session.add(category)
    db_session.commit()
    db_session.refresh(vaccine)
    db_session.refresh(category)
    return {"vaccine": vaccine, "category": category}

