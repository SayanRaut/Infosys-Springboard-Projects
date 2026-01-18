from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import SessionLocal
from app.models.banking import User, Account, Transaction, TxnType
from app.schemas.transaction import TransactionCreate, TransactionResponse

# --- CHANGE IS HERE ---
# Import get_current_user and get_db from deps, NOT security
from app.api.deps import get_current_user, get_db 
# ----------------------

router = APIRouter()

@router.post("/send", response_model=TransactionResponse)
def send_money(
    txn_in: TransactionCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Find Sender's Account (Prefer Checking, then Savings)
    sender_account = db.query(Account).filter(
        Account.user_id == current_user.id
    ).order_by(Account.balance.desc()).first()
    
    if not sender_account:
        raise HTTPException(status_code=400, detail="No active account found to send money from.")

    # 2. Check Balance
    if sender_account.balance < txn_in.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds.")

    # 3. Find Recipient
    recipient = db.query(User).filter(User.email == txn_in.recipient_email).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found.")
    
    if recipient.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot send money to yourself.")

    # 4. Find Recipient's Account
    recipient_account = db.query(Account).filter(
        Account.user_id == recipient.id
    ).first()
    
    if not recipient_account:
        raise HTTPException(status_code=400, detail="Recipient has no active bank account.")

    # 5. EXECUTE TRANSFER (Atomic Transaction)
    try:
        # Deduct from Sender
        sender_account.balance -= txn_in.amount
        
        sender_txn = Transaction(
            account_id=sender_account.id,
            description=f"Transfer to {recipient.name}",
            category="Transfer",
            amount=-txn_in.amount,
            currency=sender_account.currency,
            txn_type=TxnType.debit,
            merchant=recipient.name 
        )
        db.add(sender_txn)

        # Add to Recipient
        recipient_account.balance += txn_in.amount
        
        recipient_txn = Transaction(
            account_id=recipient_account.id,
            description=f"Received from {current_user.name}",
            category="Transfer",
            amount=txn_in.amount,
            currency=recipient_account.currency,
            txn_type=TxnType.credit,
            merchant=current_user.name
        )
        db.add(recipient_txn)
        
        db.commit()
        db.refresh(sender_txn)
        return sender_txn

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all", response_model=List[TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch all transactions for all of the user's accounts
    account_ids = [acc.id for acc in current_user.accounts]
    transactions = db.query(Transaction).filter(
        Transaction.account_id.in_(account_ids)
    ).order_by(Transaction.txn_date.desc()).all()
    return transactions