import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions import ForbiddenException
from app.models.user import User
from app.repositories.company_repository import CompanyRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.project_repository import ProjectRepository
from app.schemas.order import OrderListResponse, OrderResponse
from app.services.order_service import OrderService

router = APIRouter()


def _get_order_service(db: AsyncSession = Depends(get_db)) -> OrderService:
    return OrderService(
        order_repo=OrderRepository(db),
        project_repo=ProjectRepository(db),
    )


async def _get_user_company_id(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> uuid.UUID:
    company_repo = CompanyRepository(db)
    company = await company_repo.get_by_user_id(user.id)
    if not company:
        raise ForbiddenException("企業情報を先に登録してください")
    return company.id


@router.get("", response_model=OrderListResponse)
async def list_my_orders(
    company_id: uuid.UUID = Depends(_get_user_company_id),
    service: OrderService = Depends(_get_order_service),
):
    return await service.list_my_orders(company_id)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: uuid.UUID,
    _user: User = Depends(get_current_user),
    service: OrderService = Depends(_get_order_service),
):
    return await service.get_order(order_id)


@router.post("/{order_id}/complete", response_model=OrderResponse)
async def complete_order(
    order_id: uuid.UUID,
    company_id: uuid.UUID = Depends(_get_user_company_id),
    service: OrderService = Depends(_get_order_service),
):
    return await service.complete_order(order_id=order_id, company_id=company_id)
