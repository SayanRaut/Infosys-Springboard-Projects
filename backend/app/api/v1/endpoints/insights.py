from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date, timedelta, datetime
from app.api import deps
from app.models.banking import User, Transaction, Account, TxnType
from pydantic import BaseModel

router = APIRouter()

class CashFlowPoint(BaseModel):
    month: str
    income: float
    expense: float

class TopMerchant(BaseModel):
    name: str
    amount: float
    percentage: float

class BurnRate(BaseModel):
    current_burn_rate: float
    average_burn_rate: float
    status: str # 'Good', 'Warning', 'Critical'
    runway_months: float

@router.get("/cash-flow", response_model=List[CashFlowPoint])
def get_cash_flow(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    months: int = 6
) -> Any:
    """
    Get monthly income vs expense for the last N months.
    """
    # 0. Get user accounts
    account_ids = [acc.id for acc in current_user.accounts]
    if not account_ids:
        return []

    # 1. Calculate date range
    today = date.today()
    start_date = today.replace(day=1) - timedelta(days=30*months) # Approx

    # 2. Query Transactions
    # We need to aggregate by month.
    # Postgres/SQLite diffs make this tricky in pure ORM without dialect specific functions.
    # We will fetch raw and process in python for simplicity and DB agnostic behavior for this scale.
    
    txns = db.query(Transaction).filter(
        Transaction.account_id.in_(account_ids),
        Transaction.txn_date >= start_date
    ).all()

    # 3. Process
    monthly_data = {} # "YYYY-MM" -> {income: 0, expense: 0}

    # Initialize last N months
    for i in range(months):
        d = today.replace(day=1) - timedelta(days=30*i)
        key = d.strftime("%Y-%m")
        monthly_data[key] = {"income": 0.0, "expense": 0.0, "month": d.strftime("%b")}

    for t in txns:
        # Assuming t.txn_date is date or datetime
        t_date = t.txn_date if isinstance(t.txn_date, date) else t.txn_date.date()
        key = t_date.strftime("%Y-%m")
        
        if key in monthly_data:
            amount = float(t.amount or 0.0) # Handle NULL amount and convert to float
            if amount > 0: 
                if t.txn_type == TxnType.credit:
                    monthly_data[key]["income"] += amount
            else:
                 if t.txn_type == TxnType.debit:
                    monthly_data[key]["expense"] += abs(amount)

    # 4. Format
    result = []
    # Sort by key (date)
    for key in sorted(monthly_data.keys()):
        data = monthly_data[key]
        result.append(CashFlowPoint(
            month=data["month"],
            income=round(data["income"], 2),
            expense=round(data["expense"], 2)
        ))

    return result

@router.get("/top-merchants", response_model=List[TopMerchant])
def get_top_merchants(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    limit: int = 5
) -> Any:
    """
    Get top merchants by spending (Debits).
    """
    account_ids = [acc.id for acc in current_user.accounts]
    if not account_ids:
        return []

    # Fetch all debits
    # Exclude "Transfer" category if internal? For now checking category != "Transfer"
    txns = db.query(Transaction).filter(
        Transaction.account_id.in_(account_ids),
        Transaction.txn_type == TxnType.debit,
        Transaction.amount < 0
    ).all()

    merchant_spending = {}
    total_spent = 0.0

    for t in txns:
        # Clean merchant name
        name = t.merchant or t.description or "Unknown"
        amount = abs(float(t.amount or 0.0))
        
        if name not in merchant_spending:
            merchant_spending[name] = 0.0
        merchant_spending[name] += amount
        total_spent += amount

    if total_spent == 0:
        return []

    # Sort
    sorted_merchants = sorted(merchant_spending.items(), key=lambda item: item[1], reverse=True)
    
    # Top N
    result = []
    for name, amount in sorted_merchants[:limit]:
        result.append(TopMerchant(
            name=name,
            amount=round(amount, 2),
            percentage=round((amount / total_spent * 100), 1)
        ))

    return result

@router.get("/burn-rate", response_model=BurnRate)
def get_burn_rate(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Calculate burn rate (Avg monthly expense) and Runway (Total Cash / Burn Rate).
    """
    account_ids = [acc.id for acc in current_user.accounts]
    if not account_ids:
        return BurnRate(current_burn_rate=0, average_burn_rate=0, status="Good", runway_months=999)

    # 1. Calculate Total Balance
    total_balance = sum(float(acc.balance or 0.0) for acc in current_user.accounts)

    # 2. Calculate Avg Monthly Expense (Last 3 months)
    today = date.today()
    three_months_ago = today - timedelta(days=90)
    
    expenses_3mo = db.query(func.sum(Transaction.amount)).filter(
        Transaction.account_id.in_(account_ids),
        Transaction.txn_type == TxnType.debit,
        Transaction.txn_date >= three_months_ago
    ).scalar() or 0.0
    expenses_3mo = float(expenses_3mo)
    
    expenses_3mo = abs(expenses_3mo)
    avg_burn_rate = expenses_3mo / 3.0 if expenses_3mo > 0 else 0.0

    # Current month burn rate (just for comparison, maybe projected)
    start_of_month = today.replace(day=1)
    current_month_expense = db.query(func.sum(Transaction.amount)).filter(
        Transaction.account_id.in_(account_ids),
        Transaction.txn_type == TxnType.debit,
        Transaction.txn_date >= start_of_month
    ).scalar() or 0.0
    current_month_expense = float(current_month_expense)
    current_month_expense = abs(current_month_expense)

    # Runway
    runway = 0.0
    if avg_burn_rate > 0:
        runway = total_balance / avg_burn_rate
    else:
        runway = 999.9 # Infinite essentially

    # Status
    # Simple logic: Runway < 3 months = Critical, < 6 months = Warning, else Good
    status_val = "Good"
    if runway < 3:
        status_val = "Critical"
    elif runway < 6:
        status_val = "Warning"

    return BurnRate(
        current_burn_rate=round(current_month_expense, 2),
        average_burn_rate=round(avg_burn_rate, 2),
        status=status_val,
        runway_months=round(runway, 1)
    )

class CategoryExpense(BaseModel):
    category: str
    amount: float
    percentage: float

@router.get("/expense-by-category", response_model=List[CategoryExpense])
def get_expense_by_category(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    months: int = 3
) -> Any:
    """
    Get spending breakdown by category for the last N months.
    """
    account_ids = [acc.id for acc in current_user.accounts]
    if not account_ids:
        return []

    today = date.today()
    start_date = today - timedelta(days=30*months)

    txns = db.query(Transaction).filter(
        Transaction.account_id.in_(account_ids),
        Transaction.txn_type == TxnType.debit,
        Transaction.amount < 0,
        Transaction.txn_date >= start_date
    ).all()

    category_spending = {}
    total_spent = 0.0

    for t in txns:
        # Check if category field exists (It does in model, but might be empty)
        # Fallback to 'Uncategorized' if null
        cat = t.category or "Uncategorized"
        amount = abs(float(t.amount or 0.0))
        
        if cat not in category_spending:
            category_spending[cat] = 0.0
        category_spending[cat] += amount
        total_spent += amount

    if total_spent == 0:
        return []

    result = []
    for cat, amount in category_spending.items():
        result.append(CategoryExpense(
            category=cat,
            amount=round(amount, 2),
            percentage=round((amount / total_spent * 100), 1)
        ))

    # Sort by amount desc
    result.sort(key=lambda x: x.amount, reverse=True)
    return result
