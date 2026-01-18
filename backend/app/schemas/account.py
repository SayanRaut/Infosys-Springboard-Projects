from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.banking import AccountType

class AccountBase(BaseModel):
    bank_name: str
    account_type: AccountType
    masked_account: str
    balance: float
    currency: str = "USD"

class AccountCreate(AccountBase):
    pin: str # 4-digit PIN

class AccountUpdate(AccountBase):
    pass

class AccountInDBBase(AccountBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Account(AccountInDBBase):
    pass
