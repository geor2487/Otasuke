import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_contractor
from app.exceptions import ForbiddenException
from app.models.user import User
from app.repositories.company_repository import CompanyRepository
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import (
    ProjectCreate,
    ProjectListResponse,
    ProjectResponse,
    ProjectStatusUpdate,
    ProjectUpdate,
)
from app.services.project_service import ProjectService

router = APIRouter()


def _get_project_service(db: AsyncSession = Depends(get_db)) -> ProjectService:
    return ProjectService(ProjectRepository(db))


async def _get_user_company_id(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> uuid.UUID:
    company_repo = CompanyRepository(db)
    company = await company_repo.get_by_user_id(user.id)
    if not company:
        raise ForbiddenException("企業情報を先に登録してください")
    return company.id


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    body: ProjectCreate,
    user: User = Depends(require_contractor),
    company_id: uuid.UUID = Depends(_get_user_company_id),
    service: ProjectService = Depends(_get_project_service),
):
    return await service.create_project(company_id=company_id, **body.model_dump())


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    status: str | None = None,
    company_id: uuid.UUID | None = None,
    specialty_id: uuid.UUID | None = None,
    location: str | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    service: ProjectService = Depends(_get_project_service),
):
    return await service.list_projects(
        status=status,
        company_id=company_id,
        specialty_id=specialty_id,
        location=location,
        page=page,
        per_page=per_page,
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: uuid.UUID,
    service: ProjectService = Depends(_get_project_service),
):
    return await service.get_project(project_id)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    body: ProjectUpdate,
    company_id: uuid.UUID = Depends(_get_user_company_id),
    service: ProjectService = Depends(_get_project_service),
):
    return await service.update_project(
        project_id=project_id,
        company_id=company_id,
        **body.model_dump(exclude_unset=True),
    )


@router.patch("/{project_id}/status", response_model=ProjectResponse)
async def update_project_status(
    project_id: uuid.UUID,
    body: ProjectStatusUpdate,
    company_id: uuid.UUID = Depends(_get_user_company_id),
    service: ProjectService = Depends(_get_project_service),
):
    return await service.update_status(
        project_id=project_id,
        company_id=company_id,
        status=body.status,
    )
