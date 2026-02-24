import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class DirectOrder(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "direct_orders"

    contractor_company_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("companies.id"), nullable=False
    )
    subcontractor_company_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("companies.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    amount: Mapped[int] = mapped_column(Numeric(15, 0), nullable=False)
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    specialty_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("specialties.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    decline_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    contractor_company = relationship(
        "Company", foreign_keys=[contractor_company_id], lazy="selectin"
    )
    subcontractor_company = relationship(
        "Company", foreign_keys=[subcontractor_company_id], lazy="selectin"
    )
    specialty = relationship("Specialty", lazy="selectin")
