from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.exceptions import AppException, app_exception_handler
from app.routers import (
    auth,
    companies,
    dashboard,
    direct_orders,
    files,
    health,
    notifications,
    orders,
    projects,
    quotes,
    reviews,
)

app = FastAPI(
    title="Kensetsu Matching API",
    description="Construction industry subcontractor matching platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppException, app_exception_handler)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(quotes.router, prefix="/api", tags=["quotes"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(reviews.router, prefix="/api", tags=["reviews"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(direct_orders.router, prefix="/api/direct-orders", tags=["direct-orders"])
app.include_router(files.router, prefix="/api", tags=["files"])
