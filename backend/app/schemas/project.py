import uuid
from datetime import datetime

from pydantic import BaseModel

from app.constants import ProjectStatus


class ProjectCreate(BaseModel):
    title: str
    description: str | None = None
    location: str | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    deadline: str | None = None
    required_specialty_id: uuid.UUID | None = None


class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    deadline: str | None = None
    required_specialty_id: uuid.UUID | None = None


class ProjectStatusUpdate(BaseModel):
    status: ProjectStatus


class ProjectFileResponse(BaseModel):
    id: uuid.UUID
    file_name: str
    file_url: str
    file_size: int | None = None

    model_config = {"from_attributes": True}


class ProjectResponse(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    title: str
    description: str | None = None
    location: str | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    deadline: str | None = None
    status: str
    required_specialty_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime
    files: list[ProjectFileResponse] = []

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    items: list[ProjectResponse]
    total: int
    page: int
    per_page: int
    pages: int
