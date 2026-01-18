# backend/app/routers/transactions.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models, schemas, auth
from datetime import datetime

router = APIRouter(tags=["Transactions"])

@router.post("/transactions/send")
def send_money(
    transfer: schemas.TransferRequest, # You need to define this schema
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # 1. Get Sender Account
    sender_acc = db.query(models.Account).filter(
        models.Account.user_id == current_user.id,
        models.Account.id == transfer.account_id
    ).first()

    if not sender_acc:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if sender_acc.balance < transfer.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    # 2. Deduct Balance
    sender_acc.balance -= transfer.amount

    # 3. Create Transaction Record
    new_txn = models.Transaction(
        account_id=sender_acc.id,
        description=f"Transfer to {transfer.recipient_name}",
        category="Transfer",
        amount=-transfer.amount, # Negative for debit
        currency=sender_acc.currency,
        txn_type="debit",
        merchant=transfer.recipient_name, # Storing person name as merchant for simplicity
        txn_date=datetime.utcnow(),
        posted_date=datetime.utcnow()
    )

    db.add(new_txn)
    db.commit()
    db.refresh(new_txn)

    return {"message": "Transfer successful", "new_balance": sender_acc.balance}