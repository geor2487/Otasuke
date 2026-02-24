import uuid
from datetime import datetime

from pydantic import BaseModel


class OrderResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    quote_id: uuid.UUID
    contractor_company_id: uuid.UUID
    subcontractor_company_id: uuid.UUID
    amount: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
