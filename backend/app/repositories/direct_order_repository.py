import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.direct_order import DirectOrder


class DirectOrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, direct_order_id: uuid.UUID) -> DirectOrder | None:
        result = await self.db.execute(
            select(DirectOrder)
            .options(
                selectinload(DirectOrder.contractor_company),
                selectinload(DirectOrder.subcontractor_company),
                selectinload(DirectOrder.specialty),
            )
            .where(DirectOrder.id == direct_order_id)
        )
        return result.scalar_one_or_none()

    async def list_by_company(
        self, company_id: uuid.UUID, status: str | None = None
    ) -> list[DirectOrder]:
        query = (
            select(DirectOrder)
            .options(
                selectinload(DirectOrder.contractor_company),
                selectinload(DirectOrder.subcontractor_company),
                selectinload(DirectOrder.specialty),
            )
            .where(
                (DirectOrder.contractor_company_id == company_id)
                | (DirectOrder.subcontractor_company_id == company_id)
            )
        )
        if status is not None:
            query = query.where(DirectOrder.status == status)
        query = query.order_by(DirectOrder.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create(self, **kwargs) -> DirectOrder:
        direct_order = DirectOrder(**kwargs)
        self.db.add(direct_order)
        await self.db.flush()
        return await self.get_by_id(direct_order.id)

    async def update_status(self, direct_order: DirectOrder, status: str) -> DirectOrder:
        direct_order.status = status
        await self.db.flush()
        return await self.get_by_id(direct_order.id)

    async def update_decline_reason(self, direct_order: DirectOrder, reason: str | None) -> None:
        direct_order.decline_reason = reason
        await self.db.flush()
