import uuid
from datetime import date, datetime

from pydantic import BaseModel, field_validator


class DirectOrderCreate(BaseModel):
    title: str
    description: str | None = None
    location: str | None = None
    amount: int
    deadline: date | None = None
    specialty_id: uuid.UUID | None = None
    subcontractor_company_id: uuid.UUID

    @field_validator("deadline")
    @classmethod
    def deadline_must_be_future(cls, v: date | None) -> date | None:
        if v is not None and v < date.today():
            raise ValueError("期限は今日以降の日付を指定してください")
        return v


class DirectOrderDecline(BaseModel):
    decline_reason: str | None = None


class CompanyBrief(BaseModel):
    id: uuid.UUID
    name: str

    model_config = {"from_attributes": True}


class SpecialtyBrief(BaseModel):
    id: uuid.UUID
    name: str

    model_config = {"from_attributes": True}


class DirectOrderResponse(BaseModel):
    id: uuid.UUID
    contractor_company_id: uuid.UUID
    subcontractor_company_id: uuid.UUID
    title: str
    description: str | None = None
    location: str | None = None
    amount: int
    deadline: date | None = None
    specialty_id: uuid.UUID | None = None
    status: str
    decline_reason: str | None = None
    contractor_company: CompanyBrief | None = None
    subcontractor_company: CompanyBrief | None = None
    specialty: SpecialtyBrief | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DirectOrderListResponse(BaseModel):
    items: list[DirectOrderResponse]
    total: int
