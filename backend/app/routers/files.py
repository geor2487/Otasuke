import uuid

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions import ForbiddenException, NotFoundException
from app.models.user import User
from app.repositories.company_repository import CompanyRepository
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectFileResponse
from app.utils.s3 import upload_file

router = APIRouter()


@router.post(
    "/projects/{project_id}/files",
    response_model=ProjectFileResponse,
    status_code=201,
)
async def upload_project_file(
    project_id: uuid.UUID,
    file: UploadFile,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    company_repo = CompanyRepository(db)
    company = await company_repo.get_by_user_id(user.id)
    if not company:
        raise ForbiddenException("企業情報を先に登録してください")

    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(project_id)
    if not project:
        raise NotFoundException("案件が見つかりません")
    if project.company_id != company.id:
        raise ForbiddenException("この案件にファイルをアップロードする権限がありません")

    content = await file.read()
    file_url = upload_file(
        file_content=content,
        file_name=file.filename or "unnamed",
        content_type=file.content_type or "application/octet-stream",
    )

    project_file = await project_repo.add_file(
        project_id=project_id,
        file_name=file.filename or "unnamed",
        file_url=file_url,
        file_size=len(content),
    )
    return project_file
