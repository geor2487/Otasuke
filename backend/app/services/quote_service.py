import uuid

from app.constants import ProjectStatus, QuoteStatus
from app.exceptions import BadRequestException, ForbiddenException, NotFoundException
from app.repositories.order_repository import OrderRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.quote_repository import QuoteRepository


class QuoteService:
    def __init__(
        self,
        quote_repo: QuoteRepository,
        project_repo: ProjectRepository,
        order_repo: OrderRepository | None = None,
    ):
        self.quote_repo = quote_repo
        self.project_repo = project_repo
        self.order_repo = order_repo

    async def submit_quote(self, project_id: uuid.UUID, company_id: uuid.UUID, **kwargs):
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise NotFoundException("案件が見つかりません")
        if project.status != ProjectStatus.OPEN.value:
            raise BadRequestException("この案件は見積もりを受け付けていません")
        if project.company_id == company_id:
            raise ForbiddenException("自社の案件に見積もりはできません")

        existing = await self.quote_repo.get_by_project_and_company(project_id, company_id)
        if existing:
            raise BadRequestException("既にこの案件に見積もりを提出しています")

        return await self.quote_repo.create(project_id=project_id, company_id=company_id, **kwargs)

    async def list_project_quotes(self, project_id: uuid.UUID):
        quotes = await self.quote_repo.list_by_project(project_id)
        return {"items": quotes, "total": len(quotes)}

    async def list_my_quotes(self, company_id: uuid.UUID):
        quotes = await self.quote_repo.list_by_company(company_id)
        return {"items": quotes, "total": len(quotes)}

    async def accept_quote(self, quote_id: uuid.UUID, contractor_company_id: uuid.UUID):
        """見積もり承認 -> 他の見積もり自動却下 -> 発注自動作成 -> 案件ステータス変更"""
        quote = await self.quote_repo.get_by_id(quote_id)
        if not quote:
            raise NotFoundException("見積もりが見つかりません")

        project = await self.project_repo.get_by_id(quote.project_id)
        if not project:
            raise NotFoundException("案件が見つかりません")
        if project.company_id != contractor_company_id:
            raise ForbiddenException("この見積もりを承認する権限がありません")
        if quote.status != QuoteStatus.SUBMITTED.value:
            raise BadRequestException("この見積もりは既に処理されています")

        # Accept the quote
        quote = await self.quote_repo.update_status(quote, QuoteStatus.ACCEPTED.value)

        # Reject other submitted quotes
        await self.quote_repo.reject_other_quotes(quote.project_id, quote.id)

        # Auto-create order
        if self.order_repo:
            await self.order_repo.create(
                project_id=quote.project_id,
                quote_id=quote.id,
                contractor_company_id=contractor_company_id,
                subcontractor_company_id=quote.company_id,
                amount=quote.amount,
            )

        # Close the project
        await self.project_repo.update_status(project, ProjectStatus.CLOSED.value)

        return quote

    async def reject_quote(self, quote_id: uuid.UUID, contractor_company_id: uuid.UUID):
        quote = await self.quote_repo.get_by_id(quote_id)
        if not quote:
            raise NotFoundException("見積もりが見つかりません")

        project = await self.project_repo.get_by_id(quote.project_id)
        if not project:
            raise NotFoundException("案件が見つかりません")
        if project.company_id != contractor_company_id:
            raise ForbiddenException("この見積もりを却下する権限がありません")
        if quote.status != QuoteStatus.SUBMITTED.value:
            raise BadRequestException("この見積もりは既に処理されています")

        return await self.quote_repo.update_status(quote, QuoteStatus.REJECTED.value)
