import uuid

from sqlalchemy import ForeignKey, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Project(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "projects"

    company_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("companies.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(String(500))
    budget_min: Mapped[int | None] = mapped_column(Numeric(15, 0))
    budget_max: Mapped[int | None] = mapped_column(Numeric(15, 0))
    deadline: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="draft")
    required_specialty_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("specialties.id")
    )

    company = relationship("Company", backref="projects", lazy="selectin")
    required_specialty = relationship("Specialty", lazy="selectin")
    files = relationship("ProjectFile", back_populates="project", lazy="selectin")
    quotes = relationship("Quote", back_populates="project", lazy="selectin")


class ProjectFile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "project_files"

    project_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    file_size: Mapped[int | None] = mapped_column(Integer)

    project = relationship("Project", back_populates="files")
