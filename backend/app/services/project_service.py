import uuid
from math import ceil

from app.constants import ProjectStatus
from app.exceptions import BadRequestException, ForbiddenException, NotFoundException
from app.repositories.project_repository import ProjectRepository


class ProjectService:
    def __init__(self, project_repo: ProjectRepository):
        self.project_repo = project_repo

    async def create_project(self, company_id: uuid.UUID, **kwargs):
        return await self.project_repo.create(company_id=company_id, **kwargs)

    async def get_project(self, project_id: uuid.UUID):
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise NotFoundException("案件が見つかりません")
        return project

    async def list_projects(
        self,
        status: str | None = None,
        company_id: uuid.UUID | None = None,
        specialty_id: uuid.UUID | None = None,
        location: str | None = None,
        page: int = 1,
        per_page: int = 20,
    ):
        projects, total = await self.project_repo.list_projects(
            status=status,
            company_id=company_id,
            specialty_id=specialty_id,
            location=location,
            page=page,
            per_page=per_page,
        )
        return {
            "items": projects,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": ceil(total / per_page) if total > 0 else 0,
        }

    async def update_project(self, project_id: uuid.UUID, company_id: uuid.UUID, **kwargs):
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise NotFoundException("案件が見つかりません")
        if project.company_id != company_id:
            raise ForbiddenException("この案件を編集する権限がありません")
        return await self.project_repo.update(project, **kwargs)

    async def update_status(
        self, project_id: uuid.UUID, company_id: uuid.UUID, status: ProjectStatus
    ):
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise NotFoundException("案件が見つかりません")
        if project.company_id != company_id:
            raise ForbiddenException("この案件のステータスを変更する権限がありません")

        valid_transitions = {
            ProjectStatus.DRAFT.value: [ProjectStatus.OPEN, ProjectStatus.CANCELLED],
            ProjectStatus.OPEN.value: [ProjectStatus.CLOSED, ProjectStatus.CANCELLED],
            ProjectStatus.CLOSED.value: [ProjectStatus.IN_PROGRESS],
            ProjectStatus.IN_PROGRESS.value: [ProjectStatus.COMPLETED],
        }
        allowed = valid_transitions.get(project.status, [])
        if status not in allowed:
            raise BadRequestException(
                f"ステータスを {project.status} から {status.value} に変更できません"
            )

        return await self.project_repo.update_status(project, status.value)
