import uuid

from app.constants import DirectOrderStatus, NotificationType
from app.exceptions import BadRequestException, ForbiddenException, NotFoundException
from app.repositories.company_repository import CompanyRepository
from app.repositories.direct_order_repository import DirectOrderRepository
from app.repositories.notification_repository import NotificationRepository
from app.schemas.direct_order import DirectOrderCreate
from app.services.notification_service import NotificationService


class DirectOrderService:
    def __init__(
        self,
        direct_order_repo: DirectOrderRepository,
        company_repo: CompanyRepository,
        notification_repo: NotificationRepository,
    ):
        self.direct_order_repo = direct_order_repo
        self.company_repo = company_repo
        self.notification_service = NotificationService(notification_repo)

    async def create_direct_order(self, contractor_company_id: uuid.UUID, data: DirectOrderCreate):
        # Validate contractor != subcontractor
        if contractor_company_id == data.subcontractor_company_id:
            raise BadRequestException("自社に直接発注はできません")

        # Validate subcontractor exists
        subcontractor = await self.company_repo.get_by_id(data.subcontractor_company_id)
        if not subcontractor:
            raise NotFoundException("指定された下請け企業が見つかりません")

        direct_order = await self.direct_order_repo.create(
            contractor_company_id=contractor_company_id,
            subcontractor_company_id=data.subcontractor_company_id,
            title=data.title,
            description=data.description,
            location=data.location,
            amount=data.amount,
            deadline=data.deadline,
            specialty_id=data.specialty_id,
            status=DirectOrderStatus.PENDING.value,
        )

        # Notify the subcontractor
        await self.notification_service.create_notification(
            user_id=subcontractor.user_id,
            notification_type=NotificationType.DIRECT_ORDER_RECEIVED,
            title="直接発注を受信しました",
            message=f"「{data.title}」の直接発注が届きました。",
            reference_id=direct_order.id,
        )

        return direct_order

    async def get_direct_order(self, direct_order_id: uuid.UUID):
        direct_order = await self.direct_order_repo.get_by_id(direct_order_id)
        if not direct_order:
            raise NotFoundException("直接発注が見つかりません")
        return direct_order

    async def list_my_direct_orders(self, company_id: uuid.UUID, status: str | None = None):
        direct_orders = await self.direct_order_repo.list_by_company(company_id, status)
        return {"items": direct_orders, "total": len(direct_orders)}

    async def accept_direct_order(
        self, direct_order_id: uuid.UUID, subcontractor_company_id: uuid.UUID
    ):
        direct_order = await self.direct_order_repo.get_by_id(direct_order_id)
        if not direct_order:
            raise NotFoundException("直接発注が見つかりません")

        if direct_order.subcontractor_company_id != subcontractor_company_id:
            raise ForbiddenException("この直接発注を承認する権限がありません")

        if direct_order.status != DirectOrderStatus.PENDING.value:
            raise BadRequestException("この直接発注は承認できる状態ではありません")

        direct_order = await self.direct_order_repo.update_status(
            direct_order, DirectOrderStatus.ACCEPTED.value
        )

        # Notify the contractor
        contractor = await self.company_repo.get_by_id(direct_order.contractor_company_id)
        if contractor:
            await self.notification_service.create_notification(
                user_id=contractor.user_id,
                notification_type=NotificationType.DIRECT_ORDER_ACCEPTED,
                title="直接発注が承認されました",
                message=f"「{direct_order.title}」の直接発注が承認されました。",
                reference_id=direct_order.id,
            )

        return direct_order

    async def decline_direct_order(
        self,
        direct_order_id: uuid.UUID,
        subcontractor_company_id: uuid.UUID,
        reason: str | None = None,
    ):
        direct_order = await self.direct_order_repo.get_by_id(direct_order_id)
        if not direct_order:
            raise NotFoundException("直接発注が見つかりません")

        if direct_order.subcontractor_company_id != subcontractor_company_id:
            raise ForbiddenException("この直接発注を辞退する権限がありません")

        if direct_order.status != DirectOrderStatus.PENDING.value:
            raise BadRequestException("この直接発注は辞退できる状態ではありません")

        if reason:
            await self.direct_order_repo.update_decline_reason(direct_order, reason)

        direct_order = await self.direct_order_repo.update_status(
            direct_order, DirectOrderStatus.DECLINED.value
        )

        # Notify the contractor
        contractor = await self.company_repo.get_by_id(direct_order.contractor_company_id)
        if contractor:
            await self.notification_service.create_notification(
                user_id=contractor.user_id,
                notification_type=NotificationType.DIRECT_ORDER_DECLINED,
                title="直接発注が辞退されました",
                message=f"「{direct_order.title}」の直接発注が辞退されました。",
                reference_id=direct_order.id,
            )

        return direct_order

    async def start_direct_order(self, direct_order_id: uuid.UUID, company_id: uuid.UUID):
        direct_order = await self.direct_order_repo.get_by_id(direct_order_id)
        if not direct_order:
            raise NotFoundException("直接発注が見つかりません")

        is_contractor = direct_order.contractor_company_id == company_id
        is_subcontractor = direct_order.subcontractor_company_id == company_id
        if not is_contractor and not is_subcontractor:
            raise ForbiddenException("この直接発注を開始する権限がありません")

        if direct_order.status != DirectOrderStatus.ACCEPTED.value:
            raise BadRequestException("この直接発注は開始できる状態ではありません")

        direct_order = await self.direct_order_repo.update_status(
            direct_order, DirectOrderStatus.IN_PROGRESS.value
        )

        return direct_order

    async def complete_direct_order(self, direct_order_id: uuid.UUID, company_id: uuid.UUID):
        direct_order = await self.direct_order_repo.get_by_id(direct_order_id)
        if not direct_order:
            raise NotFoundException("直接発注が見つかりません")

        is_contractor = direct_order.contractor_company_id == company_id
        is_subcontractor = direct_order.subcontractor_company_id == company_id
        if not is_contractor and not is_subcontractor:
            raise ForbiddenException("この直接発注を完了する権限がありません")

        if direct_order.status != DirectOrderStatus.IN_PROGRESS.value:
            raise BadRequestException("この直接発注は完了できる状態ではありません")

        direct_order = await self.direct_order_repo.update_status(
            direct_order, DirectOrderStatus.COMPLETED.value
        )

        # Notify the other party
        if is_contractor:
            other_company = await self.company_repo.get_by_id(
                direct_order.subcontractor_company_id
            )
        else:
            other_company = await self.company_repo.get_by_id(direct_order.contractor_company_id)

        if other_company:
            await self.notification_service.create_notification(
                user_id=other_company.user_id,
                notification_type=NotificationType.DIRECT_ORDER_COMPLETED,
                title="直接発注が完了しました",
                message=f"「{direct_order.title}」の直接発注が完了しました。",
                reference_id=direct_order.id,
            )

        return direct_order

    async def cancel_direct_order(
        self, direct_order_id: uuid.UUID, contractor_company_id: uuid.UUID
    ):
        direct_order = await self.direct_order_repo.get_by_id(direct_order_id)
        if not direct_order:
            raise NotFoundException("直接発注が見つかりません")

        if direct_order.contractor_company_id != contractor_company_id:
            raise ForbiddenException("この直接発注をキャンセルする権限がありません")

        if direct_order.status not in (
            DirectOrderStatus.PENDING.value,
            DirectOrderStatus.ACCEPTED.value,
        ):
            raise BadRequestException("この直接発注はキャンセルできる状態ではありません")

        direct_order = await self.direct_order_repo.update_status(
            direct_order, DirectOrderStatus.CANCELLED.value
        )

        # Notify the subcontractor
        subcontractor = await self.company_repo.get_by_id(direct_order.subcontractor_company_id)
        if subcontractor:
            await self.notification_service.create_notification(
                user_id=subcontractor.user_id,
                notification_type=NotificationType.DIRECT_ORDER_CANCELLED,
                title="直接発注がキャンセルされました",
                message=f"「{direct_order.title}」の直接発注がキャンセルされました。",
                reference_id=direct_order.id,
            )

        return direct_order
