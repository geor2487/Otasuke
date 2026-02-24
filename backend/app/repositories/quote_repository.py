import uuid

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.constants import QuoteStatus
from app.models.quote import Quote


class QuoteRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, quote_id: uuid.UUID) -> Quote | None:
        result = await self.db.execute(
            select(Quote).options(selectinload(Quote.company)).where(Quote.id == quote_id)
        )
        return result.scalar_one_or_none()

    async def get_by_project_and_company(
        self, project_id: uuid.UUID, company_id: uuid.UUID
    ) -> Quote | None:
        result = await self.db.execute(
            select(Quote).where(
                Quote.project_id == project_id,
                Quote.company_id == company_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_by_project(self, project_id: uuid.UUID) -> list[Quote]:
        result = await self.db.execute(
            select(Quote)
            .options(selectinload(Quote.company))
            .where(Quote.project_id == project_id)
            .order_by(Quote.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_by_company(self, company_id: uuid.UUID) -> list[Quote]:
        result = await self.db.execute(
            select(Quote)
            .options(selectinload(Quote.company))
            .where(Quote.company_id == company_id)
            .order_by(Quote.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, project_id: uuid.UUID, company_id: uuid.UUID, **kwargs) -> Quote:
        quote = Quote(project_id=project_id, company_id=company_id, **kwargs)
        self.db.add(quote)
        await self.db.flush()
        return await self.get_by_id(quote.id)

    async def update_status(self, quote: Quote, status: str) -> Quote:
        quote.status = status
        await self.db.flush()
        return await self.get_by_id(quote.id)

    async def reject_other_quotes(self, project_id: uuid.UUID, accepted_quote_id: uuid.UUID):
        await self.db.execute(
            update(Quote)
            .where(
                Quote.project_id == project_id,
                Quote.id != accepted_quote_id,
                Quote.status == QuoteStatus.SUBMITTED.value,
            )
            .values(status=QuoteStatus.REJECTED.value)
        )
        await self.db.flush()
