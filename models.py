from sqlalchemy import Column , Integer , String , Boolean , ForeignKey , DateTime
from database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, unique=True, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    created_at   = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    session = Column(Boolean, default=False)
    #relations
    assets_r = relationship("Asset", back_populates="owners_r")
    group_r = relationship("Group", back_populates="owners_r")
    commands_r = relationship("CommandRequest", back_populates="owners_r")
    blogs_r = relationship("Blog", back_populates="owners_r")
    script_category_r = relationship("ScriptsCategory", back_populates="owners_r")
    scripts_r = relationship("Scripts", back_populates="owners_r")

class Asset(Base):
    __tablename__ = "assets"

    asset_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    ip = Column(String, unique=True, index=True, nullable=False)
    technology = Column(Integer,ForeignKey("technologies.technology_id"))
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # foreign key to user table
    owner_id = Column(Integer, ForeignKey("users.user_id"))
    group_id = Column(Integer, ForeignKey("groups.group_id"))
    # relationships
    owners_r = relationship("User", back_populates="assets_r")
    commands_r = relationship("CommandRequest", back_populates="assets_r")
    group_r = relationship("Group", back_populates="assets_r")
    blogs_r = relationship("Blog", back_populates="assets_r")
    technologies_r = relationship("Technology", back_populates="assets_r")

class Group(Base):
    __tablename__ = "groups"

    group_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    color = Column(String, default="#3b82f6")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # foreign key to user table
    owner_id = Column(Integer, ForeignKey("users.user_id"))
    # relationship
    assets_r = relationship("Asset", back_populates="group_r")
    owners_r = relationship("User", back_populates="group_r")

class CommandRequest(Base):
    __tablename__ = "command_request"
    command_id = Column(Integer, primary_key=True, index=True)
    command = Column(String)
    status = Column(String, nullable=False)
    output = Column(String)
    duration = Column(String, nullable=False)
    error = Column(String)
    asset_id = Column(Integer, ForeignKey("assets.asset_id"))
    created_at   = Column(DateTime, default=datetime.utcnow)
    
    # foreign key to user table
    owner_id = Column(Integer, ForeignKey("users.user_id"))

    #relations
    owners_r = relationship("User", back_populates="commands_r")
    assets_r = relationship("Asset",  back_populates="commands_r")

class Blog(Base):
    __tablename__ = "blogs"
    blog_id = Column(Integer,primary_key=True , index= True)
    blog_title = Column(String, nullable= False)
    asset_post_type = Column(Boolean, default=False)
    blog_content = Column(String, nullable=False)
    blog_created_at = Column(DateTime, default=datetime.utcnow)
    blog_is_active = Column(Boolean ,default=True)

    #foreign key to the asset table
    asset_id = Column(Integer,ForeignKey("assets.asset_id"),nullable=True)
    owner_id = Column(Integer,ForeignKey("users.user_id"))
    
    #relations
    assets_r = relationship("Asset", back_populates="blogs_r")
    owners_r = relationship("User", back_populates="blogs_r")

class Scripts(Base):
    __tablename__ = "scripts"
    script_uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    script_name = Column(String, nullable= False)
    script_extension = Column(String, nullable= False)
    script_source = Column(String, nullable= False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)
    script_is_active = Column(Boolean ,default=True)

    owner_id= Column(Integer,ForeignKey("users.user_id"))
    script_category_id = Column(Integer,ForeignKey("scripts_category.script_category_id"),nullable=False)

    owners_r = relationship("User", back_populates="scripts_r")
    script_category_r = relationship("ScriptsCategory", back_populates="scripts_r")

class ScriptsCategory(Base):
    __tablename__ = "scripts_category"
    script_category_id = Column(Integer,primary_key=True , index= True)
    script_category_name = Column(String, nullable= False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)
    script_category_is_active = Column(Boolean ,default=True)
    
    owner_id= Column(Integer,ForeignKey("users.user_id"))

    owners_r = relationship("User", back_populates="script_category_r")
    scripts_r = relationship("Scripts", back_populates="script_category_r")

class Technology(Base):
    __tablename__ = "technologies"

    technology_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    

    assets_r = relationship("Asset",  back_populates="technologies_r")

