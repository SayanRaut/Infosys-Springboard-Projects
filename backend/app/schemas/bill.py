from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from enum import Enum

class BillStatus(str, Enum):
    upcoming = "upcoming"
    paid = "paid"
    overdue = "overdue"

class BillBase(BaseModel):
    biller_name: str
    due_date: date
    amount_due: float
    status: BillStatus = BillStatus.upcoming
    auto_pay: bool = False
    auto_pay_time: Optional[str] = None

class BillCreate(BillBase):
    pass

class BillUpdate(BaseModel):
    biller_name: Optional[str] = None
    due_date: Optional[date] = None
    amount_due: Optional[float] = None
    status: Optional[BillStatus] = None
    auto_pay: Optional[bool] = None
    auto_pay_time: Optional[str] = None

class BillInDBBase(BillBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Bill(BillInDBBase):
    pass
