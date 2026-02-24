import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants import OrderStatus, ProjectStatus, QuoteStatus
from app.models.order import Order
from app.models.project import Project
from app.models.quote import Quote
from app.models.review import Review


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_contractor_dashboard(self, company_id: uuid.UUID) -> dict:
        # Project counts
        total = await self._count(
            select(func.count()).select_from(Project).where(Project.company_id == company_id)
        )
        open_count = await self._count(
            select(func.count())
            .select_from(Project)
            .where(Project.company_id == company_id, Project.status == ProjectStatus.OPEN.value)
        )
        in_progress = await self._count(
            select(func.count())
            .select_from(Project)
            .where(
                Project.company_id == company_id,
                Project.status == ProjectStatus.IN_PROGRESS.value,
            )
        )
        completed = await self._count(
            select(func.count())
            .select_from(Project)
            .where(
                Project.company_id == company_id,
                Project.status == ProjectStatus.COMPLETED.value,
            )
        )

        # Order count
        total_orders = await self._count(
            select(func.count())
            .select_from(Order)
            .where(Order.contractor_company_id == company_id)
        )

        # Pending quotes across my projects
        pending_quotes = await self._count(
            select(func.count())
            .select_from(Quote)
            .join(Project, Quote.project_id == Project.id)
            .where(
                Project.company_id == company_id,
                Quote.status == QuoteStatus.SUBMITTED.value,
            )
        )

        return {
            "total_projects": total,
            "open_projects": open_count,
            "in_progress_projects": in_progress,
            "completed_projects": completed,
            "total_orders": total_orders,
            "pending_quotes": pending_quotes,
        }

    async def get_subcontractor_dashboard(self, company_id: uuid.UUID) -> dict:
        total_quotes = await self._count(
            select(func.count()).select_from(Quote).where(Quote.company_id == company_id)
        )
        accepted_quotes = await self._count(
            select(func.count())
            .select_from(Quote)
            .where(
                Quote.company_id == company_id,
                Quote.status == QuoteStatus.ACCEPTED.value,
            )
        )
        active_orders = await self._count(
            select(func.count())
            .select_from(Order)
            .where(
                Order.subcontractor_company_id == company_id,
                Order.status == OrderStatus.CONFIRMED.value,
            )
        )
        completed_orders = await self._count(
            select(func.count())
            .select_from(Order)
            .where(
                Order.subcontractor_company_id == company_id,
                Order.status == OrderStatus.COMPLETED.value,
            )
        )

        # Average rating
        avg_result = await self.db.execute(
            select(func.avg(Review.rating)).where(Review.reviewee_company_id == company_id)
        )
        avg = avg_result.scalar_one_or_none()
        average_rating = round(float(avg), 2) if avg else None

        return {
            "total_quotes": total_quotes,
            "accepted_quotes": accepted_quotes,
            "active_orders": active_orders,
            "completed_orders": completed_orders,
            "average_rating": average_rating,
        }

    async def _count(self, query) -> int:
        result = await self.db.execute(query)
        return result.scalar_one()
