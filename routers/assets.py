from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session , joinedload
from models import Asset , User , Group , Technology
from database import get_db
from schemas import AssetAdd , AssetResponse , AssetUpdate
from utils import create_access_token, encrypt_data,decrypt_data,hash_password , verify_password
from auth import get_current_user, custom_openapi
from datetime import datetime
import traceback

router = APIRouter(prefix="/asset/v1", tags=["assets"])

@router.post("/add-asset")
def add_asset(asset : AssetAdd ,current_user :  dict = Depends(get_current_user), db : Session = Depends(get_db)):
    existing_asset=db.query(Asset).filter(Asset.ip==asset.ip).first()
    existing_group=db.query(Group).filter(Group.name==asset.group).first()
    existing_tech = db.query(Technology).filter(Technology.technology_id == asset.technology).first()
    if existing_asset:
        raise HTTPException(status_code=400 , detail=f"Asset IP:{asset.ip} already exists")
    if not existing_group:
        new_group = Group(name=asset.group,
                          color=asset.group_color,
                          owner_id=current_user["user_id"],
                          created_at=datetime.utcnow())
        db.add(new_group)
        db.commit()
        db.refresh(new_group)
        group_id=new_group.group_id
    else:
        group_id=existing_group.group_id
    if not existing_tech:
        raise HTTPException(status_code=400 , detail=f"Technology:{asset.technology} doesn't exists")
    else:
        technology_id=existing_tech.technology_id
    new_asset=Asset(
    name = asset.name,
    ip = asset.ip,
    technology = technology_id,
    username = asset.username,
    password = encrypt_data(asset.password),
    group_id = group_id,
    owner_id = current_user["user_id"],
    created_at = datetime.utcnow(),
    is_active = True
    )
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset

@router.put("/edit-asset/{asset_id}")
def edit_asset(
    asset_id: int,
    asset: AssetUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_asset = db.query(Asset).filter(
        Asset.asset_id == asset_id,
        Asset.owner_id == current_user["user_id"]
    ).first()

    if not existing_asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    print("Editing asset:", asset.dict())

    # Conditionally update fields
    if asset.name is not None:
        existing_asset.name = asset.name

    if asset.technology is not None:
        tech = db.query(Technology).filter(Technology.technology_id == asset.technology).first()
        if not tech:
            raise HTTPException(status_code=400, detail=f"Technology ID {asset.technology} does not exist")
        existing_asset.technology = tech.technology_id

    if asset.username is not None:
        existing_asset.username = asset.username

    if asset.password:
        existing_asset.password = encrypt_data(asset.password)

    if asset.group:
        group = db.query(Group).filter(Group.name == asset.group).first()
        if not group:
            group = Group(
                name=asset.group,
                color=asset.group_color or "#3b82f6",
                owner_id=current_user["user_id"],
                created_at=datetime.utcnow()
            )
            db.add(group)
            db.commit()
            db.refresh(group)
        existing_asset.group_id = group.group_id

    if asset.is_active is not None:
        existing_asset.is_active = asset.is_active

    try:
        db.commit()
        db.refresh(existing_asset)
    except Exception as e:
        db.rollback()
        print("❌ Commit or Refresh Error:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error while saving asset update")

    return {
            "success": True,
            "message": f"Asset '{existing_asset.name}' edited successfully"
        }




@router.delete("/delete-asset/{asset_id}")
def delete_asset(asset_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    username = current_user["sub"]
    existing_user = db.query(User).filter(User.username == username).first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    existing_asset = db.query(Asset).filter(Asset.asset_id == asset_id,Asset.owner_id == existing_user.user_id).first()
    if not existing_asset:
        raise HTTPException(status_code=400, detail=f"Asset with ID {asset_id} doesn't exist for the user")
    existing_asset.is_active = False
    existing_asset.ip = existing_asset.ip + '_deleted'
    db.commit()
    db.refresh(existing_asset)
    return {
            "success": True,
            "message": f"Asset '{existing_asset.name}' deleted successfully"
        }

@router.get("/get-assets")
def get_assets(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    fetch_assets = (
        db.query(Asset)
        .options(joinedload(Asset.group_r))
        .filter(Asset.owner_id == current_user["user_id"], Asset.is_active == True)
        .all()
    )
    return [AssetResponse.from_orm(asset) for asset in fetch_assets]
# @router.put("/update-asset/{asset_id}", response_model=AssetResponse)
# def update_asset(asset_id : int, asset_update : AssetUpdate,current_user :  dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     asset = db.query(Asset).filter(Asset.asset_id==asset_id ,Asset.owner_id==current_user["user_id"])
#     if not asset:
#         raise HTTPException(status_code=404,detail="Asset not found")
    