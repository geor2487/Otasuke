import uuid

from sqlalchemy import Column, Float, ForeignKey, Integer, String, Table, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

company_specialties = Table(
    "company_specialties",
    Base.metadata,
    Column("company_id", Uuid, ForeignKey("companies.id"), primary_key=True),
    Column("specialty_id", Uuid, ForeignKey("specialties.id"), primary_key=True),
)


class Specialty(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "specialties"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)


class Company(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "companies"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), unique=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(2000))
    address: Mapped[str | None] = mapped_column(String(500))
    phone: Mapped[str | None] = mapped_column(String(20))
    website: Mapped[str | None] = mapped_column(String(255))
    established_year: Mapped[int | None] = mapped_column(Integer)
    employee_count: Mapped[int | None] = mapped_column(Integer)
    average_rating: Mapped[float | None] = mapped_column(Float, default=None)

    user = relationship("User", backref="company")
    specialties = relationship("Specialty", secondary=company_specialties, lazy="selectin")
