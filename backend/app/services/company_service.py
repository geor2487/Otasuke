import uuid

from app.exceptions import ForbiddenException, NotFoundException
from app.repositories.company_repository import CompanyRepository


class CompanyService:
    def __init__(self, company_repo: CompanyRepository):
        self.company_repo = company_repo

    async def get_my_company(self, user_id: uuid.UUID):
        company = await self.company_repo.get_by_user_id(user_id)
        if not company:
            raise NotFoundException("企業情報が登録されていません")
        return company

    async def get_company(self, company_id: uuid.UUID):
        company = await self.company_repo.get_by_id(company_id)
        if not company:
            raise NotFoundException("企業が見つかりません")
        return company

    async def create_company(self, user_id: uuid.UUID, **kwargs):
        existing = await self.company_repo.get_by_user_id(user_id)
        if existing:
            raise ForbiddenException("企業情報は既に登録されています")
        return await self.company_repo.create(user_id=user_id, **kwargs)

    async def update_company(self, user_id: uuid.UUID, **kwargs):
        company = await self.company_repo.get_by_user_id(user_id)
        if not company:
            raise NotFoundException("企業情報が登録されていません")
        return await self.company_repo.update(company, **kwargs)

    async def update_specialties(self, user_id: uuid.UUID, specialty_ids: list[uuid.UUID]):
        company = await self.company_repo.get_by_user_id(user_id)
        if not company:
            raise NotFoundException("企業情報が登録されていません")
        return await self.company_repo.set_specialties(company, specialty_ids)

    async def get_all_specialties(self):
        return await self.company_repo.get_all_specialties()

    async def list_subcontractors(
        self,
        specialty_id: uuid.UUID | None = None,
        keyword: str | None = None,
        location: str | None = None,
        min_rating: float | None = None,
        page: int = 1,
        per_page: int = 20,
    ) -> dict:
        items, total = await self.company_repo.list_subcontractors(
            specialty_id=specialty_id,
            keyword=keyword,
            location=location,
            min_rating=min_rating,
            page=page,
            per_page=per_page,
        )
        pages = (total + per_page - 1) // per_page if per_page > 0 else 0
        return {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": pages,
        }
