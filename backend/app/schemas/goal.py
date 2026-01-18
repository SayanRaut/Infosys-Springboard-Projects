from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class GoalBase(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    deadline: Optional[date] = None
    color: str = "bg-emerald-500"

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    color: Optional[str] = None
    deadline: Optional[date] = None

class GoalInDBBase(GoalBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Goal(GoalInDBBase):
    pass
