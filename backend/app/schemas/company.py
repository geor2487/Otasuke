import uuid
from datetime import datetime

from pydantic import BaseModel


class CompanyCreate(BaseModel):
    name: str
    description: str | None = None
    address: str | None = None
    phone: str | None = None
    website: str | None = None
    established_year: int | None = None
    employee_count: int | None = None


class CompanyUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    address: str | None = None
    phone: str | None = None
    website: str | None = None
    established_year: int | None = None
    employee_count: int | None = None


class CompanyResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: str | None = None
    address: str | None = None
    phone: str | None = None
    website: str | None = None
    established_year: int | None = None
    employee_count: int | None = None
    average_rating: float | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SpecialtyResponse(BaseModel):
    id: uuid.UUID
    name: str

    model_config = {"from_attributes": True}


class CompanyWithSpecialtiesResponse(CompanyResponse):
    specialties: list[SpecialtyResponse] = []


class CompanySpecialtiesUpdate(BaseModel):
    specialty_ids: list[uuid.UUID]


class SubcontractorListResponse(BaseModel):
    items: list[CompanyWithSpecialtiesResponse]
    total: int
    page: int
    per_page: int
    pages: int
