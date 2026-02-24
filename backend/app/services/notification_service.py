import uuid

from app.constants import NotificationType
from app.repositories.notification_repository import NotificationRepository


class NotificationService:
    def __init__(self, notification_repo: NotificationRepository):
        self.notification_repo = notification_repo

    async def create_notification(
        self,
        user_id: uuid.UUID,
        notification_type: NotificationType,
        title: str,
        message: str | None = None,
        reference_id: uuid.UUID | None = None,
    ):
        return await self.notification_repo.create(
            user_id=user_id,
            type=notification_type.value,
            title=title,
            message=message,
            reference_id=reference_id,
        )

    async def list_notifications(self, user_id: uuid.UUID, unread_only: bool = False):
        notifications = await self.notification_repo.list_by_user(user_id, unread_only)
        unread_count = await self.notification_repo.count_unread(user_id)
        return {
            "items": notifications,
            "total": len(notifications),
            "unread_count": unread_count,
        }

    async def mark_as_read(self, notification_id: uuid.UUID, user_id: uuid.UUID):
        return await self.notification_repo.mark_as_read(notification_id, user_id)

    async def mark_all_as_read(self, user_id: uuid.UUID):
        return await self.notification_repo.mark_all_as_read(user_id)
