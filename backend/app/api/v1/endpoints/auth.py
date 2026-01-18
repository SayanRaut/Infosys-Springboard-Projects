from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
# ADDED: Account and AccountType for auto-creation
from app.models.banking import User, Account, AccountType
from app.schemas.user import UserCreate, UserVerify, UserLogin, UserResponse, UserForgotPassword, UserResetPassword, UserUpdate
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.email import send_otp_email
import random
import string
# ADDED: Decimal for balance handling
from decimal import Decimal

from app.api import deps

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(deps.get_current_user)):
    """
    Get current user.
    """
    return current_user



@router.put("/me", response_model=UserResponse)
def update_user_me(
    user_in: UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Update current user profile.
    """
    if user_in.name is not None:
        current_user.name = user_in.name
    if user_in.email is not None:
        # Check if email is taken (if changed)
        if user_in.email != current_user.email:
            existing_user = db.query(User).filter(User.email == user_in.email).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already registered")
            current_user.email = user_in.email
    
    db.commit()
    db.refresh(current_user)
    return current_user

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

# --- 1. REGISTER ---
@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    otp = generate_otp()
    hashed_password = get_password_hash(user_in.password)
    
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password=hashed_password,
        otp_code=otp,
        is_active=False 
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # --- NEW: AUTO-CREATE BANK ACCOUNT FOR USER ---
    # Create a default "Checking" account with $1,000 bonus
    new_account = Account(
        user_id=new_user.id,
        bank_name="Finex Bank",
        account_type=AccountType.checking,
        masked_account=generate_otp()[:4], # Use 4 random digits for card number
        balance=Decimal(1000.00),
        currency="USD"
    )
    db.add(new_account)
    db.commit()
    # ----------------------------------------------
    
    await send_otp_email(new_user.email, otp)
    return new_user

# --- 2. VERIFY OTP ---
@router.post("/verify-otp")
def verify_otp(data: UserVerify, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.otp_code != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    user.is_active = True
    # user.otp_code = None  <--- Kept commented out as per your previous logic
    
    db.commit()
    return {"message": "Account verified successfully"}

# --- 3. LOGIN ---
@router.post("/login")
def login(user_in: UserLogin, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    
    if not user or not verify_password(user_in.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account not verified. Please verify OTP.")
        
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- 4. FORGOT PASSWORD ---
@router.post("/forgot-password")
async def forgot_password(data: UserForgotPassword, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        return {"message": "If this email exists, a code has been sent."}
    
    otp = generate_otp()
    user.otp_code = otp
    db.commit()
    
    await send_otp_email(user.email, otp)
    return {"message": "OTP sent"}

# --- 5. RESET PASSWORD ---
@router.post("/reset-password")
def reset_password(data: UserResetPassword, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.otp_code != data.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    user.password = get_password_hash(data.new_password)
    user.otp_code = None 
    db.commit()
    return {"message": "Password updated successfully"}

# --- 6. REFRESH TOKEN ---
@router.post("/refresh", response_model=UserResponse)
def refresh_token(token: str, db: Session = Depends(deps.get_db)):
    # Placeholder for refresh logic
    pass

# --- 7. KYC VERIFICATION ---
@router.post("/verify-kyc")
async def verify_kyc(user_id: int, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.kyc_status = 'verified'
    db.commit()
    return {"message": "Identity verified successfully"}