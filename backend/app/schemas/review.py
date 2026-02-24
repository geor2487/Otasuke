import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class ReviewResponse(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    reviewer_company_id: uuid.UUID
    reviewee_company_id: uuid.UUID
    rating: int
    comment: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReviewListResponse(BaseModel):
    items: list[ReviewResponse]
    total: int
    average_rating: float | None = None
