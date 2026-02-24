import uuid

from app.constants import OrderStatus
from app.exceptions import BadRequestException, ForbiddenException, NotFoundException
from app.repositories.company_repository import CompanyRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.review_repository import ReviewRepository


class ReviewService:
    def __init__(
        self,
        review_repo: ReviewRepository,
        order_repo: OrderRepository,
        company_repo: CompanyRepository,
    ):
        self.review_repo = review_repo
        self.order_repo = order_repo
        self.company_repo = company_repo

    async def create_review(
        self,
        order_id: uuid.UUID,
        reviewer_company_id: uuid.UUID,
        rating: int,
        comment: str | None = None,
    ):
        order = await self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("発注が見つかりません")

        if order.status != OrderStatus.COMPLETED.value:
            raise BadRequestException("完了した発注のみレビューできます")

        # Determine reviewer and reviewee
        if order.contractor_company_id == reviewer_company_id:
            reviewee_company_id = order.subcontractor_company_id
        elif order.subcontractor_company_id == reviewer_company_id:
            reviewee_company_id = order.contractor_company_id
        else:
            raise ForbiddenException("この発注のレビューを投稿する権限がありません")

        # Check duplicate
        existing = await self.review_repo.get_by_order_and_reviewer(order_id, reviewer_company_id)
        if existing:
            raise BadRequestException("既にこの発注のレビューを投稿しています")

        review = await self.review_repo.create(
            order_id=order_id,
            reviewer_company_id=reviewer_company_id,
            reviewee_company_id=reviewee_company_id,
            rating=rating,
            comment=comment,
        )

        # Update average rating
        avg_rating = await self.review_repo.get_average_rating(reviewee_company_id)
        if avg_rating is not None:
            await self.company_repo.update_average_rating(reviewee_company_id, avg_rating)

        return review

    async def list_company_reviews(self, company_id: uuid.UUID):
        reviews = await self.review_repo.list_by_reviewee(company_id)
        avg_rating = await self.review_repo.get_average_rating(company_id)
        return {
            "items": reviews,
            "total": len(reviews),
            "average_rating": avg_rating,
        }
