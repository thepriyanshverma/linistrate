from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Asset , User , Group
from database import get_db
from schemas import AssetAdd , AssetBase , AssetCreate , AssetResponse , AssetUpdate , DeleteAsset
from utils import create_access_token, encrypt_data,decrypt_data,hash_password , verify_password
from auth import get_current_user, custom_openapi
from datetime import datetime

router = APIRouter(prefix="/group/v1", tags=["groups"])

@router.get("/get-groups")
def get_groups(db: Session = Depends(get_db)):
    groups = db.query(Group).all()
    return [{"name": group.name, "color": group.color} for group in groups]