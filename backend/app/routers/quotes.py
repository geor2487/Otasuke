import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_contractor, require_subcontractor
from app.exceptions import ForbiddenException
from app.models.user import User
from app.repositories.company_repository import CompanyRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.quote_repository import QuoteRepository
from app.schemas.quote import QuoteCreate, QuoteListResponse, QuoteResponse
from app.services.quote_service import QuoteService

router = APIRouter()


def _get_quote_service(db: AsyncSession = Depends(get_db)) -> QuoteService:
    return QuoteService(
        quote_repo=QuoteRepository(db),
        project_repo=ProjectRepository(db),
        order_repo=OrderRepository(db),
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


@router.post(
    "/projects/{project_id}/quotes",
    response_model=QuoteResponse,
    status_code=201,
)
async def submit_quote(
    project_id: uuid.UUID,
    body: QuoteCreate,
    user: User = Depends(require_subcontractor),
    company_id: uuid.UUID = Depends(_get_user_company_id),
    service: QuoteService = Depends(_get_quote_service),
):
    return await service.submit_quote(
        project_id=project_id, company_id=company_id, **body.model_dump()
    )


@router.get("/projects/{project_id}/quotes", response_model=QuoteListResponse)
async def list_project_quotes(
    project_id: uuid.UUID,
    _user: User = Depends(get_current_user),
    service: QuoteService = Depends(_get_quote_service),
):
    return await service.list_project_quotes(project_id)


@router.get("/my-quotes", response_model=QuoteListResponse)
async def list_my_quotes(
    user: User = Depends(require_subcontractor),
    company_id: uuid.UUID = Depends(_get_user_company_id),
    service: QuoteService = Depends(_get_quote_service),
):
    return await service.list_my_quotes(company_id)


@router.post("/quotes/{quote_id}/accept", response_model=QuoteResponse)
async def accept_quote(
    quote_id: uuid.UUID,
    user: User = Depends(require_contractor),
    company_id: uuid.UUID = Depends(_get_user_company_id),
    service: QuoteService = Depends(_get_quote_service),
):
    return await service.accept_quote(quote_id=quote_id, contractor_company_id=company_id)


@router.post("/quotes/{quote_id}/reject", response_model=QuoteResponse)
async def reject_quote(
    quote_id: uuid.UUID,
    user: User = Depends(require_contractor),
    company_id: uuid.UUID = Depends(_get_user_company_id),
    service: QuoteService = Depends(_get_quote_service),
):
    return await service.reject_quote(quote_id=quote_id, contractor_company_id=company_id)
