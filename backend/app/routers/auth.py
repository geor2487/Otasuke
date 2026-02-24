from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    RefreshTokenRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()


def _get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db))


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(body: UserRegisterRequest, service: AuthService = Depends(_get_auth_service)):
    user = await service.register(email=body.email, password=body.password, role=body.role)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLoginRequest, service: AuthService = Depends(_get_auth_service)):
    return await service.login(email=body.email, password=body.password)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshTokenRequest, service: AuthService = Depends(_get_auth_service)):
    return await service.refresh(refresh_token=body.refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return user
