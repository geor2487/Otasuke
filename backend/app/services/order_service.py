import uuid

from app.constants import OrderStatus, ProjectStatus
from app.exceptions import BadRequestException, ForbiddenException, NotFoundException
from app.repositories.order_repository import OrderRepository
from app.repositories.project_repository import ProjectRepository


class OrderService:
    def __init__(self, order_repo: OrderRepository, project_repo: ProjectRepository):
        self.order_repo = order_repo
        self.project_repo = project_repo

    async def get_order(self, order_id: uuid.UUID):
        order = await self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("発注が見つかりません")
        return order

    async def list_my_orders(self, company_id: uuid.UUID):
        orders = await self.order_repo.list_by_company(company_id)
        return {"items": orders, "total": len(orders)}

    async def complete_order(self, order_id: uuid.UUID, company_id: uuid.UUID):
        order = await self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("発注が見つかりません")

        is_contractor = order.contractor_company_id == company_id
        is_subcontractor = order.subcontractor_company_id == company_id
        if not is_contractor and not is_subcontractor:
            raise ForbiddenException("この発注を完了する権限がありません")

        if order.status != OrderStatus.CONFIRMED.value:
            raise BadRequestException("この発注は完了できる状態ではありません")

        order = await self.order_repo.update_status(order, OrderStatus.COMPLETED.value)

        # Also complete the project
        project = await self.project_repo.get_by_id(order.project_id)
        if project:
            await self.project_repo.update_status(project, ProjectStatus.COMPLETED.value)

        return order
