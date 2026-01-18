from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.banking import Goal, User
from app.schemas import goal as goal_schema

router = APIRouter()

@router.get("/", response_model=List[goal_schema.Goal])
def read_goals(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve savings goals for the current user.
    """
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).offset(skip).limit(limit).all()
    return goals

@router.post("/", response_model=goal_schema.Goal)
def create_goal(
    *,
    db: Session = Depends(deps.get_db),
    goal_in: goal_schema.GoalCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new savings goal.
    """
    goal = Goal(
        **goal_in.dict(),
        user_id=current_user.id
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.put("/{goal_id}", response_model=goal_schema.Goal)
def update_goal(
    *,
    db: Session = Depends(deps.get_db),
    goal_id: int,
    goal_in: goal_schema.GoalUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a goal (e.g. add funds).
    """
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_data = goal_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)
    
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal
