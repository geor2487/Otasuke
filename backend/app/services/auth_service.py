import uuid

from app.constants import UserRole
from app.exceptions import BadRequestException, ConflictException, UnauthorizedException
from app.repositories.user_repository import UserRepository
from app.utils.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def register(self, email: str, password: str, role: UserRole):
        existing = await self.user_repo.get_by_email(email)
        if existing:
            raise ConflictException("このメールアドレスは既に登録されています")

        hashed = hash_password(password)
        user = await self.user_repo.create(email=email, hashed_password=hashed, role=role.value)
        return user

    async def login(self, email: str, password: str):
        user = await self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise UnauthorizedException("メールアドレスまたはパスワードが正しくありません")

        if not user.is_active:
            raise UnauthorizedException("アカウントが無効です")

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    async def refresh(self, refresh_token: str):
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise BadRequestException("無効なリフレッシュトークンです")

        user_id_str = payload.get("sub")
        if not user_id_str:
            raise BadRequestException("無効なトークンです")

        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError:
            raise BadRequestException("無効なトークンです")

        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise UnauthorizedException("ユーザーが見つかりません")

        access_token = create_access_token({"sub": str(user.id)})
        new_refresh_token = create_refresh_token({"sub": str(user.id)})
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
        }
