import sys
import os
from datetime import datetime
import random

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.banking import User, Budget

def populate_budgets():
    db = SessionLocal()
    try:
        user_email = "sayanraut2005@gmail.com"
        user = db.query(User).filter(User.email == user_email).first()
        
        if not user:
            print(f"User {user_email} not found!")
            return

        print(f"Found user: {user.name} ({user.id})")

        # Current Month/Year
        now = datetime.now()
        month = now.month
        year = now.year

        # Delete existing budgets for this month/year to avoid duplicates/mess
        db.query(Budget).filter(
            Budget.user_id == user.id,
            Budget.month == month,
            Budget.year == year
        ).delete()
        print("Cleared existing budgets for current month.")

        # Create new budgets
        budgets_data = [
            {"category": "Food & Dining", "limit": 15000.00, "spent": 12450.50},
            {"category": "Transportation", "limit": 5000.00, "spent": 3200.00},
            {"category": "Shopping", "limit": 10000.00, "spent": 8500.75},
            {"category": "Entertainment", "limit": 4000.00, "spent": 1200.00},
            {"category": "Bills & Utilities", "limit": 8000.00, "spent": 7800.00}, # Near limit
            {"category": "Healthcare", "limit": 5000.00, "spent": 0.00}, # Empty
        ]

        for b in budgets_data:
            budget = Budget(
                user_id=user.id,
                month=month,
                year=year,
                category=b["category"],
                limit_amount=b["limit"],
                spent_amount=b["spent"]
            )
            db.add(budget)
        
        db.commit()
        print(f"Successfully created {len(budgets_data)} budgets for {user.name}.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_budgets()
