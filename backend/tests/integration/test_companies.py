import pytest
from httpx import AsyncClient


async def _create_and_login(client: AsyncClient, email: str, role: str = "contractor") -> str:
    await client.post(
        "/api/auth/register",
        json={"email": email, "password": "testpass123", "role": role},
    )
    resp = await client.post(
        "/api/auth/login",
        json={"email": email, "password": "testpass123"},
    )
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_create_company(client: AsyncClient, random_email: str):
    token = await _create_and_login(client, random_email)
    response = await client.post(
        "/api/companies/me",
        json={"name": "Test Construction Co.", "description": "A test company"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Construction Co."


@pytest.mark.asyncio
async def test_get_my_company(client: AsyncClient, random_email: str):
    token = await _create_and_login(client, random_email)
    await client.post(
        "/api/companies/me",
        json={"name": "My Company"},
        headers={"Authorization": f"Bearer {token}"},
    )
    response = await client.get(
        "/api/companies/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "My Company"


@pytest.mark.asyncio
async def test_update_company(client: AsyncClient, random_email: str):
    token = await _create_and_login(client, random_email)
    await client.post(
        "/api/companies/me",
        json={"name": "Original Name"},
        headers={"Authorization": f"Bearer {token}"},
    )
    response = await client.patch(
        "/api/companies/me",
        json={"name": "Updated Name", "phone": "03-1234-5678"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["phone"] == "03-1234-5678"


@pytest.mark.asyncio
async def test_get_company_by_id(client: AsyncClient, random_email: str):
    token = await _create_and_login(client, random_email)
    create_resp = await client.post(
        "/api/companies/me",
        json={"name": "Public Company"},
        headers={"Authorization": f"Bearer {token}"},
    )
    company_id = create_resp.json()["id"]
    response = await client.get(
        f"/api/companies/{company_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Public Company"


@pytest.mark.asyncio
async def test_create_duplicate_company(client: AsyncClient, random_email: str):
    token = await _create_and_login(client, random_email)
    await client.post(
        "/api/companies/me",
        json={"name": "First"},
        headers={"Authorization": f"Bearer {token}"},
    )
    response = await client.post(
        "/api/companies/me",
        json={"name": "Second"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
