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


async def _setup_contractor(client: AsyncClient, email: str) -> tuple[str, dict]:
    token = await _register_login(client, email, "contractor")
    company = await _create_company(client, token, "Contractor Co")
    return token, company


async def _setup_subcontractor(client: AsyncClient, email: str) -> tuple[str, dict]:
    token = await _register_login(client, email, "subcontractor")
    company = await _create_company(client, token, "Sub Co")
    return token, company


@pytest.mark.asyncio
async def test_create_project(client: AsyncClient):
    token, _ = await _setup_contractor(client, "contractor-proj1@test.com")
    resp = await client.post(
        "/api/projects",
        json={
            "title": "Test Project",
            "description": "Build something",
            "location": "Tokyo",
            "budget_min": 1000000,
            "budget_max": 5000000,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Test Project"
    assert data["status"] == "draft"


@pytest.mark.asyncio
async def test_list_projects(client: AsyncClient):
    token, _ = await _setup_contractor(client, "contractor-proj2@test.com")
    await client.post(
        "/api/projects",
        json={"title": "Project A"},
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = await client.get("/api/projects")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert "items" in data


@pytest.mark.asyncio
async def test_get_project(client: AsyncClient):
    token, _ = await _setup_contractor(client, "contractor-proj3@test.com")
    create_resp = await client.post(
        "/api/projects",
        json={"title": "Specific Project"},
        headers={"Authorization": f"Bearer {token}"},
    )
    project_id = create_resp.json()["id"]
    resp = await client.get(f"/api/projects/{project_id}")
    assert resp.status_code == 200
    assert resp.json()["title"] == "Specific Project"


@pytest.mark.asyncio
async def test_update_project(client: AsyncClient):
    token, _ = await _setup_contractor(client, "contractor-proj4@test.com")
    create_resp = await client.post(
        "/api/projects",
        json={"title": "Old Title"},
        headers={"Authorization": f"Bearer {token}"},
    )
    project_id = create_resp.json()["id"]
    resp = await client.patch(
        f"/api/projects/{project_id}",
        json={"title": "New Title"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "New Title"


@pytest.mark.asyncio
async def test_project_status_transitions(client: AsyncClient):
    token, _ = await _setup_contractor(client, "contractor-proj5@test.com")
    create_resp = await client.post(
        "/api/projects",
        json={"title": "Status Test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    project_id = create_resp.json()["id"]

    # draft -> open
    resp = await client.patch(
        f"/api/projects/{project_id}/status",
        json={"status": "open"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "open"

    # open -> closed
    resp = await client.patch(
        f"/api/projects/{project_id}/status",
        json={"status": "closed"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "closed"


@pytest.mark.asyncio
async def test_invalid_status_transition(client: AsyncClient):
    token, _ = await _setup_contractor(client, "contractor-proj6@test.com")
    create_resp = await client.post(
        "/api/projects",
        json={"title": "Bad Transition"},
        headers={"Authorization": f"Bearer {token}"},
    )
    project_id = create_resp.json()["id"]

    # draft -> completed (invalid)
    resp = await client.patch(
        f"/api/projects/{project_id}/status",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_submit_quote(client: AsyncClient):
    c_token, _ = await _setup_contractor(client, "contractor-q1@test.com")
    s_token, _ = await _setup_subcontractor(client, "sub-q1@test.com")

    # Create and open project
    create_resp = await client.post(
        "/api/projects",
        json={"title": "Quote Test Project"},
        headers={"Authorization": f"Bearer {c_token}"},
    )
    project_id = create_resp.json()["id"]
    await client.patch(
        f"/api/projects/{project_id}/status",
        json={"status": "open"},
        headers={"Authorization": f"Bearer {c_token}"},
    )

    # Submit quote
    resp = await client.post(
        f"/api/projects/{project_id}/quotes",
        json={"amount": 3000000, "message": "We can do it", "estimated_days": 30},
        headers={"Authorization": f"Bearer {s_token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["amount"] == 3000000
    assert data["status"] == "submitted"


@pytest.mark.asyncio
async def test_accept_quote_rejects_others(client: AsyncClient):
    c_token, _ = await _setup_contractor(client, "contractor-q2@test.com")
    s1_token, _ = await _setup_subcontractor(client, "sub1-q2@test.com")
    s2_token, _ = await _setup_subcontractor(client, "sub2-q2@test.com")

    # Create and open project
    create_resp = await client.post(
        "/api/projects",
        json={"title": "Accept Test"},
        headers={"Authorization": f"Bearer {c_token}"},
    )
    project_id = create_resp.json()["id"]
    await client.patch(
        f"/api/projects/{project_id}/status",
        json={"status": "open"},
        headers={"Authorization": f"Bearer {c_token}"},
    )

    # Two subs submit quotes
    q1_resp = await client.post(
        f"/api/projects/{project_id}/quotes",
        json={"amount": 1000000},
        headers={"Authorization": f"Bearer {s1_token}"},
    )
    q2_resp = await client.post(
        f"/api/projects/{project_id}/quotes",
        json={"amount": 2000000},
        headers={"Authorization": f"Bearer {s2_token}"},
    )
    q1_id = q1_resp.json()["id"]
    q2_id = q2_resp.json()["id"]

    # Accept first quote
    resp = await client.post(
        f"/api/quotes/{q1_id}/accept",
        headers={"Authorization": f"Bearer {c_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "accepted"

    # Check project quotes - second should be rejected
    quotes_resp = await client.get(
        f"/api/projects/{project_id}/quotes",
        headers={"Authorization": f"Bearer {c_token}"},
    )
    quotes = quotes_resp.json()["items"]
    statuses = {q["id"]: q["status"] for q in quotes}
    assert statuses[q1_id] == "accepted"
    assert statuses[q2_id] == "rejected"


@pytest.mark.asyncio
async def test_reject_quote(client: AsyncClient):
    c_token, _ = await _setup_contractor(client, "contractor-q3@test.com")
    s_token, _ = await _setup_subcontractor(client, "sub-q3@test.com")

    create_resp = await client.post(
        "/api/projects",
        json={"title": "Reject Test"},
        headers={"Authorization": f"Bearer {c_token}"},
    )
    project_id = create_resp.json()["id"]
    await client.patch(
        f"/api/projects/{project_id}/status",
        json={"status": "open"},
        headers={"Authorization": f"Bearer {c_token}"},
    )

    q_resp = await client.post(
        f"/api/projects/{project_id}/quotes",
        json={"amount": 500000},
        headers={"Authorization": f"Bearer {s_token}"},
    )
    quote_id = q_resp.json()["id"]

    resp = await client.post(
        f"/api/quotes/{quote_id}/reject",
        headers={"Authorization": f"Bearer {c_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "rejected"


@pytest.mark.asyncio
async def test_subcontractor_cannot_create_project(client: AsyncClient):
    s_token, _ = await _setup_subcontractor(client, "sub-proj-deny@test.com")
    resp = await client.post(
        "/api/projects",
        json={"title": "Should Fail"},
        headers={"Authorization": f"Bearer {s_token}"},
    )
    assert resp.status_code == 403
