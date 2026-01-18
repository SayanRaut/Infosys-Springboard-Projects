from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.api import deps
from app.models.banking import User, Bill, Budget
from app.schemas.bill import BillStatus
from pydantic import BaseModel

router = APIRouter()

class Alert(BaseModel):
    id: str
    type: str # 'critical', 'warning', 'info', 'success'
    category: str # 'Bill', 'Budget', 'Account'
    title: str
    message: str
    link: str = None # Deep link to resource
    created_at: str

@router.get("/list", response_model=List[Alert])
def read_alerts(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get aggregated alerts for bills and budgets.
    """
    alerts = []
    
    # 1. BILL ALERTS
    bills = db.query(Bill).filter(Bill.user_id == current_user.id, Bill.status != BillStatus.paid).all()
    today = date.today()
    three_days_from_now = today + timedelta(days=3)

    for bill in bills:
        # Overdue
        if bill.due_date < today:
            days_overdue = (today - bill.due_date).days
            alerts.append(Alert(
                id=f"bill_overdue_{bill.id}",
                type="critical",
                category="Bill Due",
                title=f"Bill Overdue: {bill.biller_name}",
                message=f"{bill.biller_name} bill of ${bill.amount_due} is overdue by {days_overdue} days.",
                link=f"/dashboard/bills?highlight={bill.id}",
                created_at=str(bill.due_date)
            ))
        # Upcoming (Due within 3 days)
        elif bill.due_date <= three_days_from_now:
            days_left = (bill.due_date - today).days
            day_str = "today" if days_left == 0 else f"in {days_left} days"
            alerts.append(Alert(
                id=f"bill_upcoming_{bill.id}",
                type="warning",
                category="Bill Due",
                title=f"Bill Due Soon: {bill.biller_name}",
                message=f"{bill.biller_name} bill of ${bill.amount_due} is due {day_str}.",
                link=f"/dashboard/bills?highlight={bill.id}",
                created_at=str(bill.due_date)
            ))

    # 2. BUDGET ALERTS
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    for budget in budgets:
        if budget.limit_amount > 0:
            spent_pct = (budget.spent_amount / budget.limit_amount) * 100
            if spent_pct >= 100:
                 alerts.append(Alert(
                    id=f"budget_critical_{budget.id}",
                    type="critical",
                    category="Budget Alert",
                    title=f"Budget Exceeded: {budget.category}",
                    message=f"You have exceeded your {budget.category} budget of ${budget.limit_amount}.",
                    link=f"/dashboard/budgets?highlight={budget.id}",
                    created_at=str(today)
                ))
            elif spent_pct >= 80:
                alerts.append(Alert(
                    id=f"budget_warning_{budget.id}",
                    type="warning",
                    category="Budget Alert",
                    title=f"Nearing Limit: {budget.category}",
                    message=f"You have used {int(spent_pct)}% of your {budget.category} budget.",
                    link=f"/dashboard/budgets?highlight={budget.id}",
                    created_at=str(today)
                ))

    return alerts
