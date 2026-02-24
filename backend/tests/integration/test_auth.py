import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_contractor(client: AsyncClient, random_email: str):
    response = await client.post(
        "/api/auth/register",
        json={"email": random_email, "password": "testpass123", "role": "contractor"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == random_email
    assert data["role"] == "contractor"
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_register_subcontractor(client: AsyncClient, random_email: str):
    response = await client.post(
        "/api/auth/register",
        json={"email": random_email, "password": "testpass123", "role": "subcontractor"},
    )
    assert response.status_code == 201
    assert response.json()["role"] == "subcontractor"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, random_email: str):
    await client.post(
        "/api/auth/register",
        json={"email": random_email, "password": "testpass123", "role": "contractor"},
    )
    response = await client.post(
        "/api/auth/register",
        json={"email": random_email, "password": "testpass123", "role": "contractor"},
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, random_email: str):
    await client.post(
        "/api/auth/register",
        json={"email": random_email, "password": "testpass123", "role": "contractor"},
    )
    response = await client.post(
        "/api/auth/login",
        json={"email": random_email, "password": "testpass123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, random_email: str):
    await client.post(
        "/api/auth/register",
        json={"email": random_email, "password": "testpass123", "role": "contractor"},
    )
    response = await client.post(
        "/api/auth/login",
        json={"email": random_email, "password": "wrongpassword"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, random_email: str):
    await client.post(
        "/api/auth/register",
        json={"email": random_email, "password": "testpass123", "role": "contractor"},
    )
    login_resp = await client.post(
        "/api/auth/login",
        json={"email": random_email, "password": "testpass123"},
    )
    token = login_resp.json()["access_token"]
    response = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == random_email


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient, random_email: str):
    await client.post(
        "/api/auth/register",
        json={"email": random_email, "password": "testpass123", "role": "contractor"},
    )
    login_resp = await client.post(
        "/api/auth/login",
        json={"email": random_email, "password": "testpass123"},
    )
    refresh_token = login_resp.json()["refresh_token"]
    response = await client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_unauthorized_without_token(client: AsyncClient):
    response = await client.get("/api/auth/me")
    # HTTPBearer returns 403 when no credentials provided
    assert response.status_code in (401, 403)
