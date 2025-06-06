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

# @app.post("/user/v1/logout-user")
# def logout_user(user : UserLogin , db : Session =Depends(get_db)):
#     existing_user=db.query(User).filter(User.username==user.username).first()
#     if not existing_user:
#         raise HTTPException(status_code=400, detail=f"{user.username} doesnt exists")
#     if existing_user.is_active==False:
#          raise HTTPException(status_code=400, detail=f"{user.username} doesnt exists")
#     if existing_user.session==False:
#         raise HTTPException(status_code=400, detail=f"{user.username} already logged out")
#     if not verify_password(user.password,existing_user.password):
#         raise HTTPException(status_code=400, detail=f"{user.username} galat password daal dis")
#     existing_user.session = False
#     db.add(existing_user)
#     db.commit()
#     db.refresh(existing_user)
#     return {"message": f"{user.username} logged out successfully"}

# @app.post("/user/v1/delete-user")
# def delete_user(user :  dict = Depends(get_current_user) , db : Session = Depends(get_db)):
#     username = user["sub"]
#     existing_user = db.query(User).filter(User.username==username).first()
#     if not existing_user:
#         raise HTTPException(status_code=400, detail=f"{username} doesnt exists")
#     if existing_user.is_active==False:
#          raise HTTPException(status_code=400, detail=f"{username} doesnt exists")
#     if existing_user.session==False:
#         raise HTTPException(status_code=400, detail=f"{username} logged out , kindly login to update")
#     if not verify_password(user.password,existing_user.password):
#         raise HTTPException(status_code=400, detail=f"{username} galat password daal dis")

#     existing_user.is_active = False
#     db.delete(existing_user)
#     db.commit()
    
#     return {"message": f"{username} deleted successfully"}

# @router.put("/update-email")
# def update_email(update_data = UserUpdate, user :  dict = Depends(get_current_user), db : Session = Depends(get_db)):
#     username = user["sub"]
#     existing_user = db.query(User).filter(User.username==username).first()
#     if not existing_user:
#         raise HTTPException(status_code=400, detail=f"{username} doesnt exists")
#     if existing_user.is_active==False:
#          raise HTTPException(status_code=400, detail=f"{username} doesnt exists")
#     if existing_user.session==False:
#         raise HTTPException(status_code=400, detail=f"{username} logged out , kindly login to delete")
#     if not verify_password(user.password,existing_user.password):
#         raise HTTPException(status_code=400, detail=f"{username} galat password daal dis")
    
#     existing_user.email=update_data.email
#     db.commit()
#     db.refresh(existing_user)
#     return {"message": f"{username} email changed successfully"}

@router.get("/get-users")
def get_users(current_user: dict = Depends(get_current_user),db: Session = Depends(get_db)):
    username = current_user["sub"]
    existing_user = db.query(User).filter(User.username==username).first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    fetch_users = db.query(User.username).all()
    usernames = [username for (username,) in fetch_users]
    return {"users": usernames}