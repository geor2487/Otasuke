import uuid

from sqlalchemy import ForeignKey, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Quote(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "quotes"

    project_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("projects.id"), nullable=False)
    company_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("companies.id"), nullable=False)
    amount: Mapped[int] = mapped_column(Numeric(15, 0), nullable=False)
    message: Mapped[str | None] = mapped_column(Text)
    estimated_days: Mapped[int | None] = mapped_column()
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="submitted")

    project = relationship("Project", back_populates="quotes")
    company = relationship("Company", lazy="selectin")
