from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import User , Group
from database import get_db
from utils import create_access_token, encrypt_data,decrypt_data,hash_password , verify_password
from auth import get_current_user, custom_openapi

router = APIRouter(prefix="/group/v1", tags=["groups"])

@router.get("/get-groups")
def get_groups(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    existing_user = db.query(User).filter(User.user_id==current_user["user_id"])
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    groups = db.query(Group).filter(Group.owner_id==current_user["user_id"]).all()
    return [{"name": group.name, "color": group.color} for group in groups]