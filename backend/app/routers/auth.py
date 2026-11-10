from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from ..database import get_database
from ..dependencies import get_current_user
from ..models import RegisterInput, LoginInput, TokenResponse, UserPublic
from ..security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def public_user(user) -> UserPublic:
    return UserPublic(id=str(user["_id"]), name=user["name"], email=user["email"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterInput):
    db = get_database()
    user = {
        "name": payload.name.strip(),
        "email": str(payload.email).lower(),
        "password_hash": hash_password(payload.password),
    }
    try:
        result = await db.users.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    user["_id"] = result.inserted_id
    return TokenResponse(
        access_token=create_access_token(str(result.inserted_id)),
        user=public_user(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginInput):
    user = await get_database().users.find_one({"email": str(payload.email).lower()})
    if user is None or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    return TokenResponse(access_token=create_access_token(str(user["_id"])), user=public_user(user))


@router.get("/me", response_model=UserPublic)
async def me(user=Depends(get_current_user)):
    return public_user(user)
