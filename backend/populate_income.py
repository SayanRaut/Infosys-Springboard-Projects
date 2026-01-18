import sys
import os
from datetime import datetime, timedelta
import random

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.banking import User, Account, Transaction, TxnType

def populate_income():
    db = SessionLocal()
    try:
        user_email = "sayanraut2005@gmail.com"
        user = db.query(User).filter(User.email == user_email).first()
        
        if not user:
            print(f"User {user_email} not found!")
            return

        # Get Account
        account = db.query(Account).filter(Account.user_id == user.id).first()
        if not account:
            print("No account found. Run populate_transactions.py first.")
            return

        print(f"Adding income for: {user.name} (Account {account.id})")

        new_txns = []
        now = datetime.now()
        
        # 1. Salary (Monthly)
        salary_date = now.replace(day=1) # 1st of this month
        txn = Transaction(
            account_id=account.id,
            description="Salary Credit",
            category="Income",
            amount=85000.00,
            currency="INR",
            txn_type=TxnType.credit,
            merchant="Tech Solutions Ltd",
            txn_date=salary_date
        )
        db.add(txn)
        print("Added txn to session.")

        db.commit()
        print("Committed successfully.")
        
        # Add remaining if successful
        count = 1
        
        # 2. Freelance Project
        freelance_date = now - timedelta(days=random.randint(5, 20))
        txn2 = Transaction(
            account_id=account.id,
            description="Freelance Project Payment",
            category="Income",
            amount=15000.00,
            currency="INR",
            txn_type=TxnType.credit,
            merchant="Upwork Client",
            txn_date=freelance_date
        )
        db.add(txn2)
        count += 1
        
        db.commit()
        print(f"Successfully created {count} income transactions.")

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error Type: {type(e)}")
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    from datetime import timedelta # forgot import
    populate_income()
