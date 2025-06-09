from sqlalchemy import Column , Integer , String , Boolean , ForeignKey , DateTime
from database import Base
from sqlalchemy.orm import relationship
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
    group_r = relationship("Group", back_populates="owners_r")
    blogs_r = relationship("Blog", back_populates="owners_r")

class Asset(Base):
    __tablename__ = "assets"

    asset_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    ip = Column(String, unique=True, index=True, nullable=False)
    technology = Column(String, nullable=False)
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