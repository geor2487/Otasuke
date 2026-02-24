import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationListResponse
from app.services.notification_service import NotificationService

router = APIRouter()


def _get_notification_service(
    db: AsyncSession = Depends(get_db),
) -> NotificationService:
    return NotificationService(NotificationRepository(db))


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    unread_only: bool = Query(False),
    user: User = Depends(get_current_user),
    service: NotificationService = Depends(_get_notification_service),
):
    return await service.list_notifications(user.id, unread_only)


@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: uuid.UUID,
    user: User = Depends(get_current_user),
    service: NotificationService = Depends(_get_notification_service),
):
    await service.mark_as_read(notification_id, user.id)
    return {"status": "ok"}


@router.post("/read-all")
async def mark_all_as_read(
    user: User = Depends(get_current_user),
    service: NotificationService = Depends(_get_notification_service),
):
    count = await service.mark_all_as_read(user.id)
    return {"status": "ok", "marked_count": count}
