from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr, Field, ConfigDict


def utc_now():
    return datetime.now(timezone.utc)


class RegisterInput(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    content: str = Field(default="", max_length=20000)
    color: str = Field(default="violet", pattern="^(violet|blue|green|amber|rose)$")


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    content: str | None = Field(default=None, max_length=20000)
    color: str | None = Field(default=None, pattern="^(violet|blue|green|amber|rose)$")


class NotePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    content: str
    color: str
    created_at: datetime
    updated_at: datetime
