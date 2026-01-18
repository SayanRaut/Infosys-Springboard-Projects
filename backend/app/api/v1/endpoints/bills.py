from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime

from app.api import deps
from app.models.banking import Bill, User, BillStatus, Account, Transaction, TxnType, Reward
from app.schemas import bill as bill_schema

router = APIRouter()

@router.get("/all", response_model=List[bill_schema.Bill])
def read_bills(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve all bills for current user.
    """
    bills = db.query(Bill).filter(Bill.user_id == current_user.id).offset(skip).limit(limit).all()
    
    # Simple logic to auto-update overdue bills
    updated = False
    for bill in bills:
        if bill.status == BillStatus.upcoming and bill.due_date < date.today():
            bill.status = BillStatus.overdue
            updated = True
    if updated:
        db.commit()
        
    return bills

@router.post("/", response_model=bill_schema.Bill)
def create_bill(
    *,
    db: Session = Depends(deps.get_db),
    bill_in: bill_schema.BillCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new bill.
    """
    bill = Bill(
        **bill_in.dict(),
        user_id=current_user.id
    )
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill

@router.put("/{bill_id}/pay", response_model=bill_schema.Bill)
def pay_bill(
    *,
    db: Session = Depends(deps.get_db),
    bill_id: int,
    account_id: int = None, # Make it optional but preferred
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Mark a bill as paid.
    """
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == current_user.id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    # Check if already paid
    if bill.status == BillStatus.paid:
         return bill

    bill.status = BillStatus.paid
    
    # Create a Transaction record for this payment
    # Moved imports to top-level to ensure availability
    if account_id:
        print(f"DEBUG: paying bill with account_id={account_id}")

    # If account_id provided, use it. Else default.
    account = None
    if account_id:
        account = db.query(Account).filter(Account.id == account_id, Account.user_id == current_user.id).first()
    
    if not account:
        # Fallback to first available account
        account = db.query(Account).filter(Account.user_id == current_user.id).first()
        print(f"DEBUG: Fallback account found: {account.id if account else 'None'}")
    
    if account:
        # Deduct balance
        account.balance -= bill.amount_due
        
        # Determine Category based on Biller Name
        biller_lower = bill.biller_name.lower()
        category = "Bills & Utilities" # Default
        
        if any(x in biller_lower for x in ["netflix", "prime", "spotify", "hotstar", "disney", "hbo", "movie", "cinema"]):
            category = "Entertainment"
        elif any(x in biller_lower for x in ["food", "zomato", "swiggy", "burger", "pizza", "restaurant"]):
            category = "Food"
        elif any(x in biller_lower for x in ["health", "doctor", "pharmacy", "clinic", "hospital", "gym", "fitness"]):
            category = "Health"
        elif any(x in biller_lower for x in ["uber", "ola", "fuel", "petrol", "transport", "bus", "train", "flight"]):
            category = "Transport"
        elif any(x in biller_lower for x in ["shop", "amazon", "flipkart", "myntra", "store"]):
            category = "Shopping"
            
        print(f"DEBUG: Creating transaction for bill {bill.biller_name} with category {category}")

        # Create Transaction
        txn = Transaction(
            account_id=account.id,
            description=f"Bill Payment: {bill.biller_name}",
            category=category,
            amount=-bill.amount_due, # Negative for expense
            currency=account.currency,
            txn_type=TxnType.debit,
            merchant=bill.biller_name,
            txn_date=datetime.utcnow()
        )
        db.add(txn)
        
        # --- REWARDS: Award Points ---
        try:
            # 1 Point for every 10 Currency Units
            points_earned = int(bill.amount_due // 10)
            if points_earned > 0:
                reward_entry = db.query(Reward).filter(Reward.user_id == current_user.id).first()
                if not reward_entry:
                    reward_entry = Reward(user_id=current_user.id, program_name="Gold Rewards", points_balance=0)
                    db.add(reward_entry)
                
                reward_entry.points_balance += points_earned
                print(f"DEBUG: Awarded {points_earned} points to user {current_user.id}")
        except Exception as e:
            print(f"ERROR: Failed to award points: {e}")
        # -----------------------------

    else:
        print("DEBUG: No account found to pay bill!") # Critical logging
    
    db.commit()
    db.refresh(bill)
    return bill

@router.delete("/{bill_id}", response_model=bill_schema.Bill)
def delete_bill(
    *,
    db: Session = Depends(deps.get_db),
    bill_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a bill.
    """
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == current_user.id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    db.delete(bill)
    db.commit()
    return bill

@router.patch("/{bill_id}", response_model=bill_schema.Bill)
def update_bill(
    *,
    db: Session = Depends(deps.get_db),
    bill_id: int,
    bill_in: bill_schema.BillUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a bill (e.g. toggle auto_pay).
    """
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == current_user.id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    update_data = bill_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bill, field, value)

    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill

@router.get("/summary", response_model=dict)
def read_bills_summary(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get summary stats for bills.
    """
    bills = db.query(Bill).filter(Bill.user_id == current_user.id).all()
    
    total_active = len([b for b in bills if b.status != BillStatus.paid])
    
    upcoming = [b for b in bills if b.status == BillStatus.upcoming]
    due_amount = sum([b.amount_due for b in upcoming])
    upcoming_count = len(upcoming)
    
    overdue = [b for b in bills if b.status == BillStatus.overdue]
    overdue_amount = sum([b.amount_due for b in overdue])
    overdue_count = len(overdue)
    
    # Logic for "Paid this month" could be refined with paid_date, but using updated_at proxy or just status for now
    paid_count = len([b for b in bills if b.status == BillStatus.paid])
    
    return {
        "active_count": total_active,
        "due_amount": due_amount,
        "upcoming_count": upcoming_count,
        "overdue_amount": overdue_amount,
        "overdue_count": overdue_count,
        "paid_count": paid_count
    }

@router.post("/check-autopay", response_model=List[bill_schema.Bill])
def check_autopay(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Check and process bills enabled for auto-pay.
    Returns list of bills that were just paid.
    """
    # Get all active bills with auto_pay enabled
    bills = db.query(Bill).filter(
        Bill.user_id == current_user.id,
        Bill.status == BillStatus.upcoming,
        Bill.auto_pay == True,
        Bill.auto_pay_time.isnot(None)
    ).all()
    
    just_paid = []
    now = datetime.now().time()
    today = date.today()
    
    for bill in bills:
        # Parse stored time string "HH:MM"
        try:
            pay_time = datetime.strptime(bill.auto_pay_time, "%H:%M").time()
            
            # If bill is due today (or past due) AND current time is past the pay_time
            if bill.due_date <= today and now >= pay_time:
                bill.status = BillStatus.paid
                just_paid.append(bill)
        except ValueError:
            continue # Skip invalid time formats
            
    if just_paid:
        db.commit()
        for bill in just_paid:
            db.refresh(bill)
            
    return just_paid
