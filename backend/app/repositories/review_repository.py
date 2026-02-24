import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.review import Review


class ReviewRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_order_and_reviewer(
        self, order_id: uuid.UUID, reviewer_company_id: uuid.UUID
    ) -> Review | None:
        result = await self.db.execute(
            select(Review).where(
                Review.order_id == order_id,
                Review.reviewer_company_id == reviewer_company_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_by_reviewee(self, reviewee_company_id: uuid.UUID) -> list[Review]:
        result = await self.db.execute(
            select(Review)
            .options(selectinload(Review.reviewer_company))
            .where(Review.reviewee_company_id == reviewee_company_id)
            .order_by(Review.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_average_rating(self, company_id: uuid.UUID) -> float | None:
        result = await self.db.execute(
            select(func.avg(Review.rating)).where(Review.reviewee_company_id == company_id)
        )
        avg = result.scalar_one_or_none()
        return round(float(avg), 2) if avg else None

    async def create(self, **kwargs) -> Review:
        review = Review(**kwargs)
        self.db.add(review)
        await self.db.flush()
        return review
