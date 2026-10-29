def test_login_success(client, test_users):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test.admin@aarogyaseva.org", "password": "AdminTestPass123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test.admin@aarogyaseva.org"
    assert data["user"]["role"] == "administrator"
    assert "aarogya_session" in response.cookies


def test_login_invalid_password(client, test_users):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test.admin@aarogyaseva.org", "password": "WrongPassword999!"},
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_login_deactivated_account(client, test_users):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test.inactive@aarogyaseva.org", "password": "InactivePass123!"},
    )
    assert response.status_code == 403
    assert "deactivated" in response.json()["detail"].lower()


def test_get_me_authenticated(client, auth_headers):
    headers = auth_headers("admin")
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test.admin@aarogyaseva.org"
    assert data["role"] == "administrator"


def test_get_me_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_logout(client, auth_headers):
    headers = auth_headers("worker")
    response = client.post("/api/v1/auth/logout", headers=headers)
    assert response.status_code == 200
    assert "logged out" in response.json()["message"].lower()
