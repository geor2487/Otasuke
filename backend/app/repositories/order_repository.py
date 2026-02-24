import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order


class OrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, order_id: uuid.UUID) -> Order | None:
        result = await self.db.execute(
            select(Order)
            .options(
                selectinload(Order.project),
                selectinload(Order.quote),
                selectinload(Order.contractor_company),
                selectinload(Order.subcontractor_company),
            )
            .where(Order.id == order_id)
        )
        return result.scalar_one_or_none()

    async def get_by_quote_id(self, quote_id: uuid.UUID) -> Order | None:
        result = await self.db.execute(select(Order).where(Order.quote_id == quote_id))
        return result.scalar_one_or_none()

    async def list_by_company(self, company_id: uuid.UUID) -> list[Order]:
        result = await self.db.execute(
            select(Order)
            .options(
                selectinload(Order.project),
                selectinload(Order.contractor_company),
                selectinload(Order.subcontractor_company),
            )
            .where(
                (Order.contractor_company_id == company_id)
                | (Order.subcontractor_company_id == company_id)
            )
            .order_by(Order.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, **kwargs) -> Order:
        order = Order(**kwargs)
        self.db.add(order)
        await self.db.flush()
        return await self.get_by_id(order.id)

    async def update_status(self, order: Order, status: str) -> Order:
        order.status = status
        await self.db.flush()
        return await self.get_by_id(order.id)
