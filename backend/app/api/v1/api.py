from fastapi import APIRouter
from app.api.v1.endpoints import auth, transactions, accounts, budgets, goals
from app.api.v1.endpoints import bills 

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
# Add the new transactions router
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
api_router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
api_router.include_router(goals.router, prefix="/goals", tags=["goals"])
api_router.include_router(bills.router, prefix="/bills", tags=["bills"])
# Add alerts router
from app.api.v1.endpoints import alerts
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
from app.api.v1.endpoints import insights
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])

from app.api.v1.endpoints import rewards
api_router.include_router(rewards.router, prefix="/rewards", tags=["rewards"])