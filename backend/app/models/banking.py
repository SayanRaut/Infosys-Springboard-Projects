from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Enum, DateTime, Boolean, TEXT, DATE
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base
import enum

# --- ENUMS ---
class KycStatus(str, enum.Enum):
    unverified = "unverified"
    verified = "verified"

class AccountType(str, enum.Enum):
    savings = "savings"
    checking = "checking"
    credit_card = "credit_card"
    loan = "loan"
    investment = "investment"

class TxnType(str, enum.Enum):
    debit = "debit"
    credit = "credit"

class BillStatus(str, enum.Enum):
    upcoming = "upcoming"
    paid = "paid"
    overdue = "overdue"

class AlertType(str, enum.Enum):
    low_balance = "low_balance"
    bill_due = "bill_due"
    budget_exceeded = "budget_exceeded"
    reward_redeemed = "reward_redeemed"
    general = "general" # Adding general as well for safety

# --- MODELS ---

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    kyc_status = Column(Enum(KycStatus), default=KycStatus.unverified)
    otp_code = Column(String, nullable=True)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships for Modules A-E [cite: 16, 21]
    accounts = relationship("Account", back_populates="owner", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="owner", cascade="all, delete-orphan")
    bills = relationship("Bill", back_populates="owner", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="owner", cascade="all, delete-orphan")
    rewards = relationship("Reward", back_populates="owner", cascade="all, delete-orphan")

class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    bank_name = Column(String)
    account_type = Column(Enum(AccountType))
    masked_account = Column(String)
    balance = Column(Numeric(precision=12, scale=2))
    currency = Column(String(3)) 
    pin = Column(String(4), nullable=True) # Persistent PIN
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    description = Column(String)
    category = Column(String) # For Module C [cite: 19]
    amount = Column(Numeric(precision=12, scale=2))
    currency = Column(String(3))
    txn_type = Column(Enum(TxnType))
    merchant = Column(String)
    txn_date = Column(DateTime, default=datetime.utcnow)
    
    account = relationship("Account", back_populates="transactions")

class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    month = Column(Integer)
    year = Column(Integer)
    category = Column(String)
    limit_amount = Column(Numeric(precision=12, scale=2))
    spent_amount = Column(Numeric(precision=12, scale=2), default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="budgets")

class Bill(Base):
    __tablename__ = "bills"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    biller_name = Column(String)
    due_date = Column(DATE)
    amount_due = Column(Numeric(precision=12, scale=2))
    status = Column(Enum(BillStatus), default=BillStatus.upcoming)
    auto_pay = Column(Boolean, default=False)
    auto_pay_time = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="bills")

class Reward(Base):
    __tablename__ = "rewards"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    program_name = Column(String)
    points_balance = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="rewards")

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(AlertType))
    message = Column(TEXT)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="alerts")

class Goal(Base):
    __tablename__ = "savings_goals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    target_amount = Column(Numeric(precision=12, scale=2))
    current_amount = Column(Numeric(precision=12, scale=2), default=0.0)
    deadline = Column(DATE, nullable=True)
    color = Column(String, default="bg-emerald-500") # Setup for frontend classes
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="goals")

class RedeemedReward(Base):
    __tablename__ = "redeemed_rewards"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    item_name = Column(String)
    code = Column(String)
    redeemed_at = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime)
    
    owner = relationship("User", back_populates="redeemed_rewards")

# Update User relationship
User.goals = relationship("Goal", back_populates="owner", cascade="all, delete-orphan")
User.redeemed_rewards = relationship("RedeemedReward", back_populates="owner", cascade="all, delete-orphan")