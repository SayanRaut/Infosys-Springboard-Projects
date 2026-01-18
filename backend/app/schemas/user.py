from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    

class UserVerify(BaseModel):
    email: EmailStr
    otp: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_active: bool
    
    class Config:
        from_attributes = True
class UserForgotPassword(BaseModel):
    email: EmailStr

class UserResetPassword(BaseModel):
    email: EmailStr
    otp: str
    new_password: str