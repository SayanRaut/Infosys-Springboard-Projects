from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BudgetBase(BaseModel):
    category: str
    limit_amount: float
    spent_amount: float = 0.0
    month: int
    year: int

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    limit_amount: Optional[float] = None
    spent_amount: Optional[float] = None

class BudgetInDBBase(BudgetBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Budget(BudgetInDBBase):
    pass
