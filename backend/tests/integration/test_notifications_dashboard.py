import pytest
from httpx import AsyncClient


async def _register_login(client: AsyncClient, email: str, role: str) -> str:
    await client.post(
        "/api/auth/register",
        json={"email": email, "password": "testpass123", "role": role},
    )
    resp = await client.post(
        "/api/auth/login",
        json={"email": email, "password": "testpass123"},
    )
    return resp.json()["access_token"]


async def _create_company(client: AsyncClient, token: str, name: str) -> dict:
    resp = await client.post(
        "/api/companies/me",
        json={"name": name},
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp.json()


@pytest.mark.asyncio
async def test_list_notifications_empty(client: AsyncClient):
    token = await _register_login(client, "notif-1@test.com", "contractor")
    resp = await client.get(
        "/api/notifications",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["unread_count"] == 0


@pytest.mark.asyncio
async def test_mark_all_as_read(client: AsyncClient):
    token = await _register_login(client, "notif-2@test.com", "contractor")
    resp = await client.post(
        "/api/notifications/read-all",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_contractor_dashboard(client: AsyncClient):
    token = await _register_login(client, "dash-c1@test.com", "contractor")
    await _create_company(client, token, "Dashboard Contractor")

    resp = await client.get(
        "/api/dashboard/contractor",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "total_projects" in data
    assert "open_projects" in data
    assert "pending_quotes" in data
    assert data["total_projects"] == 0


@pytest.mark.asyncio
async def test_subcontractor_dashboard(client: AsyncClient):
    token = await _register_login(client, "dash-s1@test.com", "subcontractor")
    await _create_company(client, token, "Dashboard Sub")

    resp = await client.get(
        "/api/dashboard/subcontractor",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "total_quotes" in data
    assert "active_orders" in data
    assert data["total_quotes"] == 0


@pytest.mark.asyncio
async def test_contractor_cannot_access_sub_dashboard(client: AsyncClient):
    token = await _register_login(client, "dash-c2@test.com", "contractor")
    await _create_company(client, token, "Contractor Dash2")

    resp = await client.get(
        "/api/dashboard/subcontractor",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_dashboard_with_data(client: AsyncClient):
    """Test dashboard reflects created data."""
    c_token = await _register_login(client, "dash-full-c@test.com", "contractor")
    s_token = await _register_login(client, "dash-full-s@test.com", "subcontractor")
    await _create_company(client, c_token, "Dash Full Contractor")
    await _create_company(client, s_token, "Dash Full Sub")

    # Create project
    proj = await client.post(
        "/api/projects",
        json={"title": "Dashboard Test Project"},
        headers={"Authorization": f"Bearer {c_token}"},
    )
    project_id = proj.json()["id"]

    # Open it
    await client.patch(
        f"/api/projects/{project_id}/status",
        json={"status": "open"},
        headers={"Authorization": f"Bearer {c_token}"},
    )

    # Submit quote
    await client.post(
        f"/api/projects/{project_id}/quotes",
        json={"amount": 1000000},
        headers={"Authorization": f"Bearer {s_token}"},
    )

    # Check contractor dashboard
    resp = await client.get(
        "/api/dashboard/contractor",
        headers={"Authorization": f"Bearer {c_token}"},
    )
    data = resp.json()
    assert data["total_projects"] == 1
    assert data["open_projects"] == 1
    assert data["pending_quotes"] == 1

    # Check subcontractor dashboard
    resp = await client.get(
        "/api/dashboard/subcontractor",
        headers={"Authorization": f"Bearer {s_token}"},
    )
    data = resp.json()
    assert data["total_quotes"] == 1
