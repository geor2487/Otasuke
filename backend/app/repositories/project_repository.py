import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.project import Project, ProjectFile


class ProjectRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, project_id: uuid.UUID) -> Project | None:
        result = await self.db.execute(
            select(Project)
            .options(
                selectinload(Project.files),
                selectinload(Project.quotes),
                selectinload(Project.company),
                selectinload(Project.required_specialty),
            )
            .where(Project.id == project_id)
        )
        return result.scalar_one_or_none()

    async def list_projects(
        self,
        status: str | None = None,
        company_id: uuid.UUID | None = None,
        specialty_id: uuid.UUID | None = None,
        location: str | None = None,
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[list[Project], int]:
        query = select(Project).options(
            selectinload(Project.files),
            selectinload(Project.company),
        )

        if status:
            query = query.where(Project.status == status)
        if company_id:
            query = query.where(Project.company_id == company_id)
        if specialty_id:
            query = query.where(Project.required_specialty_id == specialty_id)
        if location:
            query = query.where(Project.location.ilike(f"%{location}%"))

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(Project.created_at.desc())
        query = query.offset((page - 1) * per_page).limit(per_page)
        result = await self.db.execute(query)
        projects = list(result.scalars().all())

        return projects, total

    async def create(self, company_id: uuid.UUID, **kwargs) -> Project:
        project = Project(company_id=company_id, **kwargs)
        self.db.add(project)
        await self.db.flush()
        return await self.get_by_id(project.id)

    async def update(self, project: Project, **kwargs) -> Project:
        for key, value in kwargs.items():
            if value is not None:
                setattr(project, key, value)
        await self.db.flush()
        return await self.get_by_id(project.id)

    async def update_status(self, project: Project, status: str) -> Project:
        project.status = status
        await self.db.flush()
        return await self.get_by_id(project.id)

    async def add_file(self, project_id: uuid.UUID, **kwargs) -> ProjectFile:
        file = ProjectFile(project_id=project_id, **kwargs)
        self.db.add(file)
        await self.db.flush()
        return file
