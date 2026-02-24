import uuid

from pydantic import BaseModel, EmailStr

from app.constants import UserRole


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    role: UserRole
    is_active: bool

    model_config = {"from_attributes": True}
