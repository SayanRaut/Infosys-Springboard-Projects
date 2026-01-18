from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.banking import Account, User, AccountType
from app.schemas import account as account_schema

router = APIRouter()

@router.get("/", response_model=List[account_schema.Account])
def read_accounts(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve accounts for the current user.
    """
    accounts = db.query(Account).filter(Account.user_id == current_user.id).offset(skip).limit(limit).all()
    return accounts

@router.post("/", response_model=account_schema.Account)
def create_account(
    *,
    db: Session = Depends(deps.get_db),
    account_in: account_schema.AccountCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create (Link) a new account.
    """
    account = Account(
        **account_in.dict(),
        user_id=current_user.id
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account

@router.post("/{account_id}/verify-pin", response_model=bool)
def verify_pin(
    *,
    db: Session = Depends(deps.get_db),
    account_id: int,
    pin: str,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Verify the PIN for a specific account.
    """
    account = db.query(Account).filter(Account.id == account_id, Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Simple direct comparison for now (in production, hash this!)
    if account.pin == pin:
        return True
    return False

@router.get("/summary", response_model=dict)
def read_account_summary(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get generic summary stats (for now, simple sums).
    """
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    
    net_worth = sum([acc.balance for acc in accounts if acc.account_type != AccountType.credit_card and acc.account_type != AccountType.loan])
    # Subtract liabilities
    liabilities = sum([abs(acc.balance) for acc in accounts if acc.account_type == AccountType.credit_card or acc.account_type == AccountType.loan])
    # Adjust net worth (Assets - Liabilities). Note: Credit cards usually have negative balance in DB if they are debt? 
    # Or positive balance representing debt? 
    # Let's assume positive balance in DB = user HAS money. 
    # If it's a credit card, usually negative balance = debt, positive = credit. 
    # But usually APIs return absolute debt. Let's assume standard accounting:
    # Asset > 0. Liability (Loan/CC) < 0.
    
    # Actually, let's keep it simple: 
    # Sum all balances = Net Worth.
    # Sum positive = Assets.
    # Sum negative = Liabilities.
    
    net_worth = sum([acc.balance for acc in accounts])
    assets = sum([acc.balance for acc in accounts if acc.balance > 0])
    liabilities = sum([acc.balance for acc in accounts if acc.balance < 0])

    return {
        "net_worth": net_worth,
        "assets": assets,
        "liabilities": liabilities
    }

@router.delete("/{account_id}", response_model=account_schema.Account)
def delete_account(
    *,
    db: Session = Depends(deps.get_db),
    account_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete an account.
    """
    account = db.query(Account).filter(Account.id == account_id, Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db.delete(account)
    db.commit()
    return account
