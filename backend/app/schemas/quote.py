import uuid
from datetime import datetime

from pydantic import BaseModel


class QuoteCreate(BaseModel):
    amount: int
    message: str | None = None
    estimated_days: int | None = None


class QuoteResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    company_id: uuid.UUID
    amount: int
    message: str | None = None
    estimated_days: int | None = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class QuoteListResponse(BaseModel):
    items: list[QuoteResponse]
    total: int
