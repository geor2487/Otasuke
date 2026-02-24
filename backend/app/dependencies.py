import uuid

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants import UserRole
from app.database import get_db
from app.exceptions import ForbiddenException, UnauthorizedException
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.utils.security import decode_token

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedException("無効なトークンです")

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedException("無効なトークンです")

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise UnauthorizedException("無効なトークンです")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user or not user.is_active:
        raise UnauthorizedException("ユーザーが見つかりません")
    return user


async def require_contractor(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.CONTRACTOR.value:
        raise ForbiddenException("元請け企業のみ利用可能です")
    return user


async def require_subcontractor(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.SUBCONTRACTOR.value:
        raise ForbiddenException("下請け業者のみ利用可能です")
    return user
