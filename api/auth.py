from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from core.database import get_db
from models.user import UserCreate, UserResponse, UserInDB
from core.security import get_password_hash, verify_password, create_access_token
from typing import Any

router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: Any = Depends(get_db)):
    collection = db["users"]
    existing_user = await collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.model_dump()
    new_user = UserInDB(**user_dict, hashed_password=hashed_password)
    
    result = await collection.insert_one(new_user.model_dump())
    return UserResponse(id=str(result.inserted_id), username=new_user.username, email=new_user.email)

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login", response_model=Token)
async def login_user(login_data: LoginRequest, db: Any = Depends(get_db)):
    collection = db["users"]
    user = await collection.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return Token(access_token=access_token, token_type="bearer", user=UserResponse(id=str(user["_id"]), username=user["username"], email=user["email"]))
