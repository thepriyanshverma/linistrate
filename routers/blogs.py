from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session ,joinedload
from models import Asset , User , Blog
from database import get_db
from schemas import CreateBlog ,BlogResponse , EditBlog
from utils import create_access_token, encrypt_data,decrypt_data,hash_password , verify_password
from auth import get_current_user, custom_openapi
from Command import execute_remote_command
from time import perf_counter
from datetime import datetime

router = APIRouter(prefix="/blog/v1", tags=["blogs"])


@router.post("/create-blog")
def create_blog(blog: CreateBlog , current_user : dict = Depends(get_current_user) , db: Session = Depends(get_db)):
    if blog.asset_post_type:
        blog_create = Blog(blog_title=blog.blog_title,blog_content=encrypt_data(blog.blog_content),asset_id=blog.asset_id,owner_id=current_user["user_id"])
    else:
        blog_create = Blog(blog_title=blog.blog_title,blog_content=encrypt_data(blog.blog_content),owner_id=current_user["user_id"])
    db.add(blog_create)
    db.commit()
    db.refresh(blog_create)
    return {"msesage":"Blog Created Successfully"}

@router.delete("/delete-blog/{blog_id}")
def delete_blog(blog_id: int , current_user: dict = Depends(get_current_user), db : Session = Depends(get_db)):
    delete_blog= db.query(Blog).filter(Blog.blog_id==blog_id).first()
    now=datetime.now()
    formatted_datetime = now.strftime("%Y_%m_%d_%H_%M_%S")
    deleted_title=str(delete_blog.blog_title)
    deleted_title.replace(" ","_")
    delete_blog.blog_title=delete_blog.blog_title+'_deleted_'+formatted_datetime
    delete_blog.blog_is_active=False
    db.add(delete_blog)
    db.commit()
    db.refresh(delete_blog)
    return {"message":"Deleted Succsesfully"}

@router.post("/edit-blog/{blog_id}")
def edit_blog(blog_id: int ,blog: EditBlog, current_user: dict = Depends(get_current_user), db : Session = Depends(get_db)):
    edit_blog= db.query(Blog).filter(Blog.blog_id==blog_id).first()
    if blog.asset_post_type:
        edit_blog.blog_title=blog.blog_title
        edit_blog.blog_content=encrypt_data(blog.blog_content)
        edit_blog.asset_id=blog.asset_id
    else:
        edit_blog.blog_title=blog.blog_title
        edit_blog.blog_content=encrypt_data(blog.blog_content)

    db.commit()
    db.refresh(edit_blog)
    return {"msesage":"Blog edited Successfully"}
# def delete_blog(blog: DeleteBlog , current_user: dict = Depends(get_current_user), db : Session = Depends(get_db)):
#     return {"message":"Deleted Succsesfully"}
@router.get("/get-blogs")
def get_blogs(current_user : dict = Depends(get_current_user),db: Session = Depends(get_db)):
    fetch_blogs = (
        db.query(Blog)
        .filter(Blog.owner_id == current_user["user_id"]).filter(Blog.blog_is_active==True)
        .all()
    )
    results = []
    for exec in fetch_blogs:

        results.append(
            BlogResponse(
                blog_id=exec.blog_id,
                blog_title=exec.blog_title,
                blog_content=decrypt_data(exec.blog_content),
                blog_created_at=exec.blog_created_at
            )
        )
    return results
