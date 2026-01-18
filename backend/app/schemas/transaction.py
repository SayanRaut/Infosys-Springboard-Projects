from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class TransactionCreate(BaseModel):
    recipient_email: str
    amount: Decimal
    description: Optional[str] = "Transfer"

class TransactionResponse(BaseModel):
    id: int
    amount: Decimal
    currency: str
    txn_type: str
    merchant: str
    category: str
    txn_date: datetime
    
    class Config:
        from_attributes = True