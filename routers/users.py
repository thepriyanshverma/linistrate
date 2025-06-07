from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import User
from database import get_db
from schemas import UserCreate , UserLogin , UserUpdate
from utils import create_access_token, encrypt_data,decrypt_data,hash_password , verify_password
from auth import get_current_user, custom_openapi

router = APIRouter(prefix="/user/v1", tags=["users"])


@router.post("/create-user")
def create_user(user : UserCreate , db : Session = Depends(get_db)):
    existing_user=db.query(User).filter(User.username==user.username).first()
    existing_email=db.query(User).filter(User.email==user.email).first()
    if existing_user is None and existing_email is None:
        hashed_password = hash_password(user.password)
        db_user = User(username=user.username , password= hashed_password, email=user.email)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        token_data = {"sub":db_user.username , "user_id":db_user.user_id}
        access_token = create_access_token(token_data)
        return {"user_id":db_user.user_id,
                "username":db_user.username,
                "email": db_user.email,
                "token": access_token}
    else:
        raise HTTPException(status_code=400, detail=f"{user.username} already exists")

@router.post("/loginuser")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    existing_user_user = db.query(User).filter(User.username == user.identifier).first()

    existing_user_email = db.query(User).filter(User.email == user.identifier).first()

    existing_user = existing_user_user or existing_user_email

    if not existing_user:
        raise HTTPException(status_code=400, detail=f"{user.identifier} does not exist")

    if not existing_user.is_active:
        raise HTTPException(status_code=400, detail=f"User {user.identifier} is inactive")

    if existing_user.session:
        raise HTTPException(status_code=400, detail=f"{user.identifier} already logged in")

    if not verify_password(user.password, existing_user.password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    token_data = {"sub": existing_user.username, "user_id": existing_user.user_id}
    access_token = create_access_token(token_data)

    return {
        "token": access_token,
        "token_type": "bearer",
        "message": f"{user.identifier} logged in successfully",
        "user_id": existing_user.user_id,
        "username": existing_user.username,
        "email": existing_user.email,
    }

@router.get("/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user["sub"]}


@router.post("/update-user-email")
def update_user(emailupdateuser: UserUpdate, current_user: dict = Depends(get_current_user),db: Session = Depends(get_db)):
    user_update = db.query(User).filter(User.username == current_user["sub"]).first()
    user_update.email=emailupdateuser.email
    db.commit()
    db.refresh(user_update)
    return {"message":f"{user_update.username} password updated"}

@router.post("/update-user-password")
def update_user(emailupdateuser: UserUpdate, current_user: dict = Depends(get_current_user),db: Session = Depends(get_db)):
    user_update = db.query(User).filter(User.username == current_user["sub"]).first()
    print(emailupdateuser.curpassword)
    print(user_update.password)
    if not verify_password(emailupdateuser.curpassword,user_update.password):
        raise HTTPException(status_code=403, detail="Wrong password")
    user_update.password=hash_password(emailupdateuser.newpassword)
    db.commit()
    db.refresh(user_update)
    return {"message":f"{user_update.username} password updated"}

@router.get("/get-users")
def get_users(current_user: dict = Depends(get_current_user),db: Session = Depends(get_db)):
    username = current_user["sub"]
    existing_user = db.query(User).filter(User.username==username).first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    fetch_users = db.query(User.username).all()
    usernames = [username for (username,) in fetch_users]
    return {"users": usernames}