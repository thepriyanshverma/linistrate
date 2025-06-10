from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Technology , User
from database import get_db
from auth import get_current_user, custom_openapi
from datetime import datetime

router = APIRouter(prefix="/technology/v1", tags=["technologies"])

@router.get("/get-technologies")
def get_technologies(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    existing_user = db.query(User).filter(User.user_id==current_user["user_id"])
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    technologies = db.query(Technology).all()
    return [{"technology_id": technology.technology_id,"name": technology.name} for technology in technologies]