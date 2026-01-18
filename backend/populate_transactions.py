import sys
import os
from datetime import datetime, timedelta
import random

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.banking import User, Budget, Account, Transaction, AccountType, TxnType

def populate_transactions():
    db = SessionLocal()
    try:
        user_email = "sayanraut2005@gmail.com"
        user = db.query(User).filter(User.email == user_email).first()
        
        if not user:
            print(f"User {user_email} not found!")
            return

        print(f"Found user: {user.name} ({user.id})")

        # Get or Create Account
        account = db.query(Account).filter(Account.user_id == user.id).first()
        if not account:
            print("No account found. Creating a default Savings Account.")
            account = Account(
                user_id=user.id,
                bank_name="Finex Bank",
                account_type=AccountType.savings,
                masked_account="**** 4321",
                balance=150000.00,
                currency="INR",
                pin="1234"
            )
            db.add(account)
            db.commit()
            db.refresh(account)
            print(f"Created Account ID: {account.id}")
        else:
            print(f"Using Account ID: {account.id}")

        # Budget Data (Must match populate_budgets.py)
        # category: (spent_amount, list_of_merchants)
        budget_spending = {
            "Food & Dining": (12450.50, ["Swiggy", "Zomato", "Starbucks", "Grocery Store", "McDonalds", "Pizza Hut"]),
            "Transportation": (3200.00, ["Uber", "Ola", "Metro Recharge", "Shell Station"]),
            "Shopping": (8500.75, ["Amazon", "Flipkart", "Myntra", "Zara", "H&M"]),
            "Entertainment": (1200.00, ["Netflix", "BookMyShow", "Spotify", "Steam"]),
            "Bills & Utilities": (7800.00, ["Electricity Bill", "Jio Fiber", "Mobile Postpaid", "Water Bill"]),
            "Healthcare": (0.00, ["Apollo Pharmacy", "Dr. Lal PathLabs"])
        }

        # Clear existing transactions to ensure clean slate (and fix any positive-debit errors)
        db.query(Transaction).filter(Transaction.account_id == account.id).delete()
        print("Cleared existing transactions for account.")
        
        new_txns = []
        now = datetime.now()
        
        for category, (total_spend, merchants) in budget_spending.items():
            if total_spend <= 0:
                continue
                
            # Break down total spend into 3-5 random transactions
            num_txns = random.randint(3, 5)
            remaining = total_spend
            
            for i in range(num_txns - 1):
                # Random amount between 5% and 30% of total
                amt = round(random.uniform(total_spend * 0.05, total_spend * 0.30), 2)
                if remaining - amt < 0:
                    amt = remaining
                
                remaining -= amt
                
                txn_date = now - timedelta(days=random.randint(1, 28))
                merchant = random.choice(merchants)
                
                new_txns.append(Transaction(
                    account_id=account.id,
                    description=f"Payment to {merchant}",
                    category=category,
                    amount=-abs(amt), # Ensure negative for Debit
                    currency="INR",
                    txn_type=TxnType.debit,
                    merchant=merchant,
                    txn_date=txn_date
                ))
            
            # Last transaction takes the remainder
            if remaining > 0:
                txn_date = now - timedelta(days=random.randint(1, 28))
                merchant = random.choice(merchants)
                new_txns.append(Transaction(
                    account_id=account.id,
                    description=f"Payment to {merchant}",
                    category=category,
                    amount=-abs(round(remaining, 2)), # Ensure negative
                    currency="INR",
                    txn_type=TxnType.debit,
                    merchant=merchant,
                    txn_date=txn_date
                ))

        db.bulk_save_objects(new_txns)
        db.commit()
        print(f"Successfully created {len(new_txns)} transactions matching budget spending.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_transactions()
