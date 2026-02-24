import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.company import Company, Specialty, company_specialties
from app.models.user import User


class CompanyRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user_id(self, user_id: uuid.UUID) -> Company | None:
        result = await self.db.execute(
            select(Company)
            .options(selectinload(Company.specialties))
            .where(Company.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, company_id: uuid.UUID) -> Company | None:
        result = await self.db.execute(
            select(Company)
            .options(selectinload(Company.specialties))
            .where(Company.id == company_id)
        )
        return result.scalar_one_or_none()

    async def create(self, user_id: uuid.UUID, **kwargs) -> Company:
        company = Company(user_id=user_id, **kwargs)
        self.db.add(company)
        await self.db.flush()
        # Re-fetch with selectinload to ensure specialties is loaded
        return await self.get_by_user_id(user_id)

    async def update(self, company: Company, **kwargs) -> Company:
        for key, value in kwargs.items():
            if value is not None:
                setattr(company, key, value)
        await self.db.flush()
        # Re-fetch to ensure all attributes are loaded
        return await self.get_by_id(company.id)

    async def set_specialties(self, company: Company, specialty_ids: list[uuid.UUID]) -> Company:
        result = await self.db.execute(select(Specialty).where(Specialty.id.in_(specialty_ids)))
        specialties = list(result.scalars().all())
        company.specialties = specialties
        await self.db.flush()
        return company

    async def get_all_specialties(self) -> list[Specialty]:
        result = await self.db.execute(select(Specialty).order_by(Specialty.name))
        return list(result.scalars().all())

    async def update_average_rating(self, company_id: uuid.UUID, avg_rating: float) -> None:
        company = await self.get_by_id(company_id)
        if company:
            company.average_rating = avg_rating
            await self.db.flush()

    async def list_subcontractors(
        self,
        specialty_id: uuid.UUID | None = None,
        keyword: str | None = None,
        location: str | None = None,
        min_rating: float | None = None,
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[list[Company], int]:
        # Base query: join Company with User and filter subcontractors only
        base_query = (
            select(Company)
            .join(User, Company.user_id == User.id)
            .where(User.role == "subcontractor")
        )

        if specialty_id is not None:
            base_query = base_query.join(company_specialties).where(
                company_specialties.c.specialty_id == specialty_id
            )

        if keyword is not None:
            pattern = f"%{keyword}%"
            base_query = base_query.where(
                Company.name.ilike(pattern) | Company.description.ilike(pattern)
            )

        if location is not None:
            base_query = base_query.where(Company.address.ilike(f"%{location}%"))

        if min_rating is not None:
            base_query = base_query.where(Company.average_rating >= min_rating)

        # Count total
        count_query = select(func.count()).select_from(base_query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        # Fetch paginated items
        offset = (page - 1) * per_page
        items_query = (
            base_query.options(selectinload(Company.specialties))
            .order_by(Company.created_at.desc())
            .offset(offset)
            .limit(per_page)
        )
        items_result = await self.db.execute(items_query)
        items = list(items_result.scalars().all())

        return items, total
