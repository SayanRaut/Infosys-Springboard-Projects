from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel

from app.api import deps

from app.models.banking import User, Reward, Account, Transaction, TxnType, Alert, AlertType, RedeemedReward
import random

router = APIRouter()

class RedemptionRequest(BaseModel):
    item_id: str
    item_name: str
    cost: int
    type: str  # 'cashback', 'giftcard'

class RedeemedRewardSchema(BaseModel):
    id: int
    item_name: str
    code: str
    redeemed_at: datetime
    expiry_date: datetime

    class Config:
        from_attributes = True


@router.get("/balance")
def get_balance(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user's reward point balance.
    """
    reward_entry = db.query(Reward).filter(Reward.user_id == current_user.id).first()
    if not reward_entry:
        # Create if not exists
        reward_entry = Reward(
            user_id=current_user.id,
            program_name="Gold Rewards",
            points_balance=0
        )
        db.add(reward_entry)
        db.commit()
        db.refresh(reward_entry)
    
    return {
        "points_balance": reward_entry.points_balance,
        "program_name": reward_entry.program_name
    }

@router.get("/exchange-rate")
def get_exchange_rate(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current simulates points-to-currency exchange rate.
    """
    # Simulate a fluctuating rate slightly
    base_rate = 0.10 # 1 point = 0.10 currency unit
    fluctuation = random.uniform(-0.01, 0.01)
    current_rate = round(base_rate + fluctuation, 3)
    
    return {
        "rate": current_rate,
        "currency": "INR", # Assuming INR as per context
        "timestamp": datetime.utcnow()
    }

@router.get("/my-rewards", response_model=List[RedeemedRewardSchema])
def get_my_rewards(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all redeemed rewards for the current user.
    """
    rewards = db.query(RedeemedReward).filter(
        RedeemedReward.user_id == current_user.id
    ).order_by(RedeemedReward.redeemed_at.desc()).all()
    
    return rewards

@router.post("/redeem")
async def redeem_points(
    request: RedemptionRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Redeem points for an item.
    """
    reward_entry = db.query(Reward).filter(Reward.user_id == current_user.id).first()
    if not reward_entry:
        raise HTTPException(status_code=404, detail="Rewards account not found")
        
    if reward_entry.points_balance < request.cost:
        raise HTTPException(status_code=400, detail="Insufficient points balance")
        
    # Deduct points
    reward_entry.points_balance -= request.cost
    reward_entry.last_updated = datetime.utcnow()

    # --- CASHBACK LOGIC ---
    if request.type == 'cashback':
        # 1. Fetch user's primary account (Checking preferred)
        account = db.query(Account).filter(
            Account.user_id == current_user.id
        ).order_by(Account.balance.desc()).first()
        
        if not account:
             # Fallback if no account, just deduct points (or raise error? Let's credit if exists)
             raise HTTPException(status_code=400, detail="No active bank account found to credit cashback.")
        
        # 2. Simulate Exchange Rate (Or use Fixed for reliability in transaction)
        # Using a fixed rate here to match the "cost" usually implied by the frontend button.
        # But if the frontend passes the 'cost' in points, we need to know how much $$$ that is.
        # However, for the specific "Account Credit Rs. 1000", the frontend knows the value.
        # The frontend passed 'item_name' which likely contains the value, but 'cost' is points.
        # Let's assume the frontend logic sends us an item that maps to a specific value.
        # For dynamic exchange, we calculate: Value = Points * Rate.
        # But the user asked for "ExchangeRate API thing where points will be converted".
        # Let's interpret: The frontend calculates the INR value based on live rate?
        # OR: We just credit a fixed amount based on the item description?
        # Better: Let's assume 1 Point = 0.10 INR fixed for backend reliability, or pass value in request?
        # The Request model only has item_id, name, cost(points), type.
        # Let's extract amount from name if possible, or use a standard conversion.
        # "Account Credit Rs. 1000" -> 1000.
        
        credit_amount = 0
        if "Rs." in request.item_name:
            try:
                # robust extraction
                import re
                matches = re.findall(r"Rs\.\s*([\d,]+)", request.item_name)
                if matches:
                    credit_amount = float(matches[0].replace(",", ""))
            except:
                pass
        
        # Fallback Calculation if extraction fails or for pure conversion
        if credit_amount == 0:
             credit_amount = request.cost * 0.10 # Fallback rate

        # 3. Credit Account
        account.balance += credit_amount
        
        # 4. Create Transaction
        txn = Transaction(
            account_id=account.id,
            description=f"Reward Redemption: {request.item_name}",
            category="Income",
            amount=credit_amount,
            currency=account.currency,
            txn_type=TxnType.credit,
            merchant="Finex Rewards",
            txn_date=datetime.utcnow()
        )
        db.add(txn)
    
    else:
        # --- GIFT CARD / OTHER REWARDS BASKET LOGIC ---
        from datetime import timedelta
        import uuid
        
        # Generate expiry (7 days from now)
        expiry = datetime.utcnow() + timedelta(days=7)
        
        # Generate fake code
        item_code = f"CODE-{uuid.uuid4().hex[:8].upper()}"
        
        redeemed_item = RedeemedReward(
            user_id=current_user.id,
            item_name=request.item_name,
            code=item_code,
            redeemed_at=datetime.utcnow(),
            expiry_date=expiry
        )
        db.add(redeemed_item)

    # --- ALERT GENERATION ---
    new_alert = Alert(
        user_id=current_user.id,
        type=AlertType.reward_redeemed, 
        message=f"You successfully redeemed {request.item_name} for {request.cost} points!" 
    )
    db.add(new_alert)

    # --- EMAIL NOTIFICATION ---
    try:
        from app.core.email import send_general_email
        
        email_subject = "Reward Redemption Successful"
        email_body = f"""
        <h3>Congratulations, {current_user.name}!</h3>
        <p>You have successfully redeemed <strong>{request.item_name}</strong>.</p>
        <p>Points Used: {request.cost}</p>
        <p>Remaining Balance: {reward_entry.points_balance}</p>
        <br>
        <p>Thank you for banking with us!</p>
        """
        
        await send_general_email(current_user.email, email_subject, email_body)

    except Exception as e:
        print(f"Failed to send email: {e}")

    db.commit()
    
    return {
        "success": True, 
        "message": f"Successfully redeemed {request.item_name}",
        "new_balance": reward_entry.points_balance
    }
