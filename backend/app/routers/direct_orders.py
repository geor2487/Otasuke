import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_contractor, require_subcontractor
from app.exceptions import ForbiddenException
from app.models.user import User
from app.repositories.company_repository import CompanyRepository
from app.repositories.direct_order_repository import DirectOrderRepository
from app.repositories.notification_repository import NotificationRepository
from app.schemas.direct_order import (
    DirectOrderCreate,
    DirectOrderDecline,
    DirectOrderListResponse,
    DirectOrderResponse,
)
from app.services.direct_order_service import DirectOrderService

router = APIRouter()


def _get_direct_order_service(db: AsyncSession = Depends(get_db)) -> DirectOrderService:
    return DirectOrderService(
        direct_order_repo=DirectOrderRepository(db),
        company_repo=CompanyRepository(db),
        notification_repo=NotificationRepository(db),
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


async def _get_contractor_company_id(
    user: User = Depends(require_contractor),
    db: AsyncSession = Depends(get_db),
) -> uuid.UUID:
    company_repo = CompanyRepository(db)
    company = await company_repo.get_by_user_id(user.id)
    if not company:
        raise ForbiddenException("企業情報を先に登録してください")
    return company.id


async def _get_subcontractor_company_id(
    user: User = Depends(require_subcontractor),
    db: AsyncSession = Depends(get_db),
) -> uuid.UUID:
    company_repo = CompanyRepository(db)
    company = await company_repo.get_by_user_id(user.id)
    if not company:
        raise ForbiddenException("企業情報を先に登録してください")
    return company.id


@router.post("", response_model=DirectOrderResponse)
async def create_direct_order(
    data: DirectOrderCreate,
    company_id: uuid.UUID = Depends(_get_contractor_company_id),
    service: DirectOrderService = Depends(_get_direct_order_service),
):
    return await service.create_direct_order(contractor_company_id=company_id, data=data)


@router.get("", response_model=DirectOrderListResponse)
async def list_my_direct_orders(
    status: str | None = Query(None),
    company_id: uuid.UUID = Depends(_get_user_company_id),
    service: DirectOrderService = Depends(_get_direct_order_service),
):
    return await service.list_my_direct_orders(company_id=company_id, status=status)


@router.get("/{direct_order_id}", response_model=DirectOrderResponse)
async def get_direct_order(
    direct_order_id: uuid.UUID,
    _user: User = Depends(get_current_user),
    service: DirectOrderService = Depends(_get_direct_order_service),
):
    return await service.get_direct_order(direct_order_id)


@router.post("/{direct_order_id}/accept", response_model=DirectOrderResponse)
async def accept_direct_order(
    direct_order_id: uuid.UUID,
    company_id: uuid.UUID = Depends(_get_subcontractor_company_id),
    service: DirectOrderService = Depends(_get_direct_order_service),
):
    return await service.accept_direct_order(
        direct_order_id=direct_order_id, subcontractor_company_id=company_id
    )


@router.post("/{direct_order_id}/decline", response_model=DirectOrderResponse)
async def decline_direct_order(
    direct_order_id: uuid.UUID,
    body: DirectOrderDecline | None = None,
    company_id: uuid.UUID = Depends(_get_subcontractor_company_id),
    service: DirectOrderService = Depends(_get_direct_order_service),
):
    reason = body.decline_reason if body else None
    return await service.decline_direct_order(
        direct_order_id=direct_order_id,
        subcontractor_company_id=company_id,
        reason=reason,
    )


@router.post("/{direct_order_id}/start", response_model=DirectOrderResponse)
async def start_direct_order(
    direct_order_id: uuid.UUID,
    company_id: uuid.UUID = Depends(_get_user_company_id),
    service: DirectOrderService = Depends(_get_direct_order_service),
):
    return await service.start_direct_order(direct_order_id=direct_order_id, company_id=company_id)


@router.post("/{direct_order_id}/complete", response_model=DirectOrderResponse)
async def complete_direct_order(
    direct_order_id: uuid.UUID,
    company_id: uuid.UUID = Depends(_get_user_company_id),
    service: DirectOrderService = Depends(_get_direct_order_service),
):
    return await service.complete_direct_order(
        direct_order_id=direct_order_id, company_id=company_id
    )


@router.post("/{direct_order_id}/cancel", response_model=DirectOrderResponse)
async def cancel_direct_order(
    direct_order_id: uuid.UUID,
    company_id: uuid.UUID = Depends(_get_contractor_company_id),
    service: DirectOrderService = Depends(_get_direct_order_service),
):
    return await service.cancel_direct_order(
        direct_order_id=direct_order_id, contractor_company_id=company_id
    )
