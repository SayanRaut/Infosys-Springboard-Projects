from typing import Any, List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.models.banking import Budget, User
from app.schemas import budget as budget_schema
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[budget_schema.Budget])
def read_budgets(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    month: int = datetime.now().month,
    year: int = datetime.now().year,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve budgets for the current user, defaults to current month/year.
    """
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == month,
        Budget.year == year
    ).offset(skip).limit(limit).all()
    return budgets

@router.post("/", response_model=budget_schema.Budget)
def create_budget(
    *,
    db: Session = Depends(deps.get_db),
    budget_in: budget_schema.BudgetCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new budget.
    """
    budget = Budget(
        **budget_in.dict(),
        user_id=current_user.id
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget

@router.get("/summary", response_model=dict)
def read_budget_summary(
    db: Session = Depends(deps.get_db),
    month: int = datetime.now().month,
    year: int = datetime.now().year,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get summary stats for budgets (Total Limit vs Total Spent).
    """
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == month,
        Budget.year == year
    ).all()
    
    total_budget = sum([b.limit_amount for b in budgets])
    total_spent = sum([b.spent_amount for b in budgets])
    
    # Count budgets at risk (> 80% used)
    at_risk = sum([1 for b in budgets if b.spent_amount > (b.limit_amount * Decimal('0.8'))])

    return {
        "total_budget": total_budget,
        "total_spent": total_spent,
        "remaining": total_budget - total_spent,
        "at_risk": at_risk
    }

@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a budget.
    """
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
         raise HTTPException(status_code=404, detail="Budget not found")
    
    db.delete(budget)
    db.commit()
    return {"ok": True}
