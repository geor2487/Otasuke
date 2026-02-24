import uuid

from sqlalchemy import ForeignKey, Numeric, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Order(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "orders"

    project_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("projects.id"), nullable=False)
    quote_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("quotes.id"), unique=True, nullable=False
    )
    contractor_company_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("companies.id"), nullable=False
    )
    subcontractor_company_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("companies.id"), nullable=False
    )
    amount: Mapped[int] = mapped_column(Numeric(15, 0), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="confirmed")

    project = relationship("Project", lazy="selectin")
    quote = relationship("Quote", lazy="selectin")
    contractor_company = relationship(
        "Company", foreign_keys=[contractor_company_id], lazy="selectin"
    )
    subcontractor_company = relationship(
        "Company", foreign_keys=[subcontractor_company_id], lazy="selectin"
    )
