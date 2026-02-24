from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants import UserRole
from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions import ForbiddenException
from app.models.user import User
from app.repositories.company_repository import CompanyRepository
from app.schemas.dashboard import ContractorDashboard, SubcontractorDashboard
from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get("/contractor", response_model=ContractorDashboard)
async def contractor_dashboard(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role != UserRole.CONTRACTOR.value:
        raise ForbiddenException("元請け企業のみ利用可能です")
    company_repo = CompanyRepository(db)
    company = await company_repo.get_by_user_id(user.id)
    if not company:
        raise ForbiddenException("企業情報を先に登録してください")
    service = DashboardService(db)
    return await service.get_contractor_dashboard(company.id)


@router.get("/subcontractor", response_model=SubcontractorDashboard)
async def subcontractor_dashboard(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role != UserRole.SUBCONTRACTOR.value:
        raise ForbiddenException("下請け業者のみ利用可能です")
    company_repo = CompanyRepository(db)
    company = await company_repo.get_by_user_id(user.id)
    if not company:
        raise ForbiddenException("企業情報を先に登録してください")
    service = DashboardService(db)
    return await service.get_subcontractor_dashboard(company.id)
