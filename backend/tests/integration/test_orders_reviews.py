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


async def _full_setup(client: AsyncClient, suffix: str):
    """Setup full flow: contractor + sub, project, quote, accept -> order."""
    c_token = await _register_login(client, f"c-{suffix}@test.com", "contractor")
    s_token = await _register_login(client, f"s-{suffix}@test.com", "subcontractor")
    c_company = await _create_company(client, c_token, f"Contractor {suffix}")
    s_company = await _create_company(client, s_token, f"Sub {suffix}")

    # Create project
    proj_resp = await client.post(
        "/api/projects",
        json={"title": f"Project {suffix}"},
        headers={"Authorization": f"Bearer {c_token}"},
    )
    project_id = proj_resp.json()["id"]

    # Open project
    await client.patch(
        f"/api/projects/{project_id}/status",
        json={"status": "open"},
        headers={"Authorization": f"Bearer {c_token}"},
    )

    # Submit quote
    q_resp = await client.post(
        f"/api/projects/{project_id}/quotes",
        json={"amount": 2000000},
        headers={"Authorization": f"Bearer {s_token}"},
    )
    quote_id = q_resp.json()["id"]

    # Accept quote -> auto-creates order
    await client.post(
        f"/api/quotes/{quote_id}/accept",
        headers={"Authorization": f"Bearer {c_token}"},
    )

    return {
        "c_token": c_token,
        "s_token": s_token,
        "c_company": c_company,
        "s_company": s_company,
        "project_id": project_id,
        "quote_id": quote_id,
    }


@pytest.mark.asyncio
async def test_order_auto_created_on_accept(client: AsyncClient):
    data = await _full_setup(client, "order1")

    # Check orders list for contractor
    resp = await client.get(
        "/api/orders",
        headers={"Authorization": f"Bearer {data['c_token']}"},
    )
    assert resp.status_code == 200
    orders = resp.json()
    assert orders["total"] >= 1
    order = orders["items"][0]
    assert order["amount"] == 2000000
    assert order["status"] == "confirmed"


@pytest.mark.asyncio
async def test_complete_order(client: AsyncClient):
    data = await _full_setup(client, "order2")

    # Get order
    orders_resp = await client.get(
        "/api/orders",
        headers={"Authorization": f"Bearer {data['c_token']}"},
    )
    order_id = orders_resp.json()["items"][0]["id"]

    # Complete order
    resp = await client.post(
        f"/api/orders/{order_id}/complete",
        headers={"Authorization": f"Bearer {data['c_token']}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"


@pytest.mark.asyncio
async def test_create_review_after_completion(client: AsyncClient):
    data = await _full_setup(client, "review1")

    # Get and complete order
    orders_resp = await client.get(
        "/api/orders",
        headers={"Authorization": f"Bearer {data['c_token']}"},
    )
    order_id = orders_resp.json()["items"][0]["id"]
    await client.post(
        f"/api/orders/{order_id}/complete",
        headers={"Authorization": f"Bearer {data['c_token']}"},
    )

    # Contractor reviews subcontractor
    resp = await client.post(
        f"/api/orders/{order_id}/reviews",
        json={"rating": 5, "comment": "Great work!"},
        headers={"Authorization": f"Bearer {data['c_token']}"},
    )
    assert resp.status_code == 201
    assert resp.json()["rating"] == 5

    # Subcontractor reviews contractor
    resp = await client.post(
        f"/api/orders/{order_id}/reviews",
        json={"rating": 4, "comment": "Good communication"},
        headers={"Authorization": f"Bearer {data['s_token']}"},
    )
    assert resp.status_code == 201
    assert resp.json()["rating"] == 4


@pytest.mark.asyncio
async def test_cannot_review_uncompleted_order(client: AsyncClient):
    data = await _full_setup(client, "review2")

    orders_resp = await client.get(
        "/api/orders",
        headers={"Authorization": f"Bearer {data['c_token']}"},
    )
    order_id = orders_resp.json()["items"][0]["id"]

    # Try to review without completing
    resp = await client.post(
        f"/api/orders/{order_id}/reviews",
        json={"rating": 5},
        headers={"Authorization": f"Bearer {data['c_token']}"},
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_duplicate_review_rejected(client: AsyncClient):
    data = await _full_setup(client, "review3")

    orders_resp = await client.get(
        "/api/orders",
        headers={"Authorization": f"Bearer {data['c_token']}"},
    )
    order_id = orders_resp.json()["items"][0]["id"]
    await client.post(
        f"/api/orders/{order_id}/complete",
        headers={"Authorization": f"Bearer {data['c_token']}"},
    )

    # First review
    await client.post(
        f"/api/orders/{order_id}/reviews",
        json={"rating": 5},
        headers={"Authorization": f"Bearer {data['c_token']}"},
    )

    # Duplicate review
    resp = await client.post(
        f"/api/orders/{order_id}/reviews",
        json={"rating": 3},
        headers={"Authorization": f"Bearer {data['c_token']}"},
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_company_reviews_list(client: AsyncClient):
    data = await _full_setup(client, "review4")

    orders_resp = await client.get(
        "/api/orders",
        headers={"Authorization": f"Bearer {data['c_token']}"},
    )
    order_id = orders_resp.json()["items"][0]["id"]
    await client.post(
        f"/api/orders/{order_id}/complete",
        headers={"Authorization": f"Bearer {data['c_token']}"},
    )

    # Create review
    await client.post(
        f"/api/orders/{order_id}/reviews",
        json={"rating": 4, "comment": "Solid"},
        headers={"Authorization": f"Bearer {data['c_token']}"},
    )

    # Get subcontractor reviews
    s_company_id = data["s_company"]["id"]
    resp = await client.get(f"/api/companies/{s_company_id}/reviews")
    assert resp.status_code == 200
    review_data = resp.json()
    assert review_data["total"] >= 1
    assert review_data["average_rating"] is not None


@pytest.mark.asyncio
async def test_full_lifecycle(client: AsyncClient):
    """Full lifecycle: project -> quote -> accept -> order -> complete -> review"""
    c_token = await _register_login(client, "lifecycle-c@test.com", "contractor")
    s_token = await _register_login(client, "lifecycle-s@test.com", "subcontractor")
    await _create_company(client, c_token, "LC Contractor")
    s_company = await _create_company(client, s_token, "LC Sub")

    # 1. Create project
    proj = await client.post(
        "/api/projects",
        json={"title": "Full Lifecycle", "budget_min": 1000000, "budget_max": 5000000},
        headers={"Authorization": f"Bearer {c_token}"},
    )
    assert proj.status_code == 201
    project_id = proj.json()["id"]

    # 2. Open project
    resp = await client.patch(
        f"/api/projects/{project_id}/status",
        json={"status": "open"},
        headers={"Authorization": f"Bearer {c_token}"},
    )
    assert resp.json()["status"] == "open"

    # 3. Submit quote
    quote = await client.post(
        f"/api/projects/{project_id}/quotes",
        json={"amount": 3000000, "estimated_days": 60},
        headers={"Authorization": f"Bearer {s_token}"},
    )
    assert quote.status_code == 201
    quote_id = quote.json()["id"]

    # 4. Accept quote
    resp = await client.post(
        f"/api/quotes/{quote_id}/accept",
        headers={"Authorization": f"Bearer {c_token}"},
    )
    assert resp.json()["status"] == "accepted"

    # 5. Verify order created
    orders = await client.get("/api/orders", headers={"Authorization": f"Bearer {c_token}"})
    assert orders.json()["total"] >= 1
    order_id = orders.json()["items"][0]["id"]

    # 6. Complete order
    resp = await client.post(
        f"/api/orders/{order_id}/complete",
        headers={"Authorization": f"Bearer {c_token}"},
    )
    assert resp.json()["status"] == "completed"

    # 7. Both sides review
    resp = await client.post(
        f"/api/orders/{order_id}/reviews",
        json={"rating": 5, "comment": "Excellent subcontractor"},
        headers={"Authorization": f"Bearer {c_token}"},
    )
    assert resp.status_code == 201

    resp = await client.post(
        f"/api/orders/{order_id}/reviews",
        json={"rating": 4, "comment": "Good contractor"},
        headers={"Authorization": f"Bearer {s_token}"},
    )
    assert resp.status_code == 201

    # 8. Check reviews
    resp = await client.get(f"/api/companies/{s_company['id']}/reviews")
    assert resp.json()["average_rating"] == 5.0
