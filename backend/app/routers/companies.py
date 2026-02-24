import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.repositories.company_repository import CompanyRepository
from app.schemas.company import (
    CompanyCreate,
    CompanySpecialtiesUpdate,
    CompanyUpdate,
    CompanyWithSpecialtiesResponse,
    SpecialtyResponse,
    SubcontractorListResponse,
)
from app.services.company_service import CompanyService

router = APIRouter()


def _get_company_service(db: AsyncSession = Depends(get_db)) -> CompanyService:
    return CompanyService(CompanyRepository(db))


@router.post("/me", response_model=CompanyWithSpecialtiesResponse, status_code=201)
async def create_my_company(
    body: CompanyCreate,
    user: User = Depends(get_current_user),
    service: CompanyService = Depends(_get_company_service),
):
    return await service.create_company(user_id=user.id, **body.model_dump())


@router.get("/me", response_model=CompanyWithSpecialtiesResponse)
async def get_my_company(
    user: User = Depends(get_current_user),
    service: CompanyService = Depends(_get_company_service),
):
    return await service.get_my_company(user_id=user.id)


@router.patch("/me", response_model=CompanyWithSpecialtiesResponse)
async def update_my_company(
    body: CompanyUpdate,
    user: User = Depends(get_current_user),
    service: CompanyService = Depends(_get_company_service),
):
    return await service.update_company(user_id=user.id, **body.model_dump(exclude_unset=True))


@router.put("/me/specialties", response_model=CompanyWithSpecialtiesResponse)
async def update_my_specialties(
    body: CompanySpecialtiesUpdate,
    user: User = Depends(get_current_user),
    service: CompanyService = Depends(_get_company_service),
):
    return await service.update_specialties(user_id=user.id, specialty_ids=body.specialty_ids)


@router.get("/specialties", response_model=list[SpecialtyResponse])
async def list_specialties(service: CompanyService = Depends(_get_company_service)):
    return await service.get_all_specialties()


@router.get("/subcontractors", response_model=SubcontractorListResponse)
async def list_subcontractors(
    specialty_id: uuid.UUID | None = Query(None),
    keyword: str | None = Query(None),
    location: str | None = Query(None),
    min_rating: float | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    service: CompanyService = Depends(_get_company_service),
):
    return await service.list_subcontractors(
        specialty_id=specialty_id,
        keyword=keyword,
        location=location,
        min_rating=min_rating,
        page=page,
        per_page=per_page,
    )


@router.get("/{company_id}", response_model=CompanyWithSpecialtiesResponse)
async def get_company(
    company_id: uuid.UUID,
    service: CompanyService = Depends(_get_company_service),
):
    return await service.get_company(company_id)
