import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions import ForbiddenException
from app.models.user import User
from app.repositories.company_repository import CompanyRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.review_repository import ReviewRepository
from app.schemas.review import ReviewCreate, ReviewListResponse, ReviewResponse
from app.services.review_service import ReviewService

router = APIRouter()


def _get_review_service(db: AsyncSession = Depends(get_db)) -> ReviewService:
    return ReviewService(
        review_repo=ReviewRepository(db),
        order_repo=OrderRepository(db),
        company_repo=CompanyRepository(db),
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


@router.post("/orders/{order_id}/reviews", response_model=ReviewResponse, status_code=201)
async def create_review(
    order_id: uuid.UUID,
    body: ReviewCreate,
    company_id: uuid.UUID = Depends(_get_user_company_id),
    service: ReviewService = Depends(_get_review_service),
):
    return await service.create_review(
        order_id=order_id,
        reviewer_company_id=company_id,
        rating=body.rating,
        comment=body.comment,
    )


@router.get("/companies/{company_id}/reviews", response_model=ReviewListResponse)
async def list_company_reviews(
    company_id: uuid.UUID,
    service: ReviewService = Depends(_get_review_service),
):
    return await service.list_company_reviews(company_id)
