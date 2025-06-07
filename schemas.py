from pydantic import BaseModel, Field ,ConfigDict
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str
    email: str
    is_active: bool = True

class UserLogin(BaseModel):
    identifier: str
    password: str

class UserUpdate(BaseModel):
    curpassword: str = None
    newpassword: str = None
    email: str = None

class AssetAdd(BaseModel):
    name: str
    ip: str
    technology: str
    username: str
    password: str
    group: str
    group_color: Optional[str] = "#3b82f6"

class AssetBase(BaseModel):
    name: str
    ip: str
    technology: str
    username: str
    password: str
    group: str
    is_active: Optional[bool] = True

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str]
    ip: Optional[str]
    technology: Optional[str]
    username: Optional[str]
    password: Optional[str]
    group: Optional[str]
    group_color: Optional[str]
    is_active: Optional[bool]

class GroupResponse(BaseModel):
    group_id: int
    name: str
    color: Optional[str]

    class Config:
        from_attributes = True

class AssetResponse(BaseModel):
    asset_id: int
    name: str
    ip: str
    technology: str
    username: str
    password: str
    created_at: datetime
    is_active: bool
    owner_id: int
    group_r: Optional[GroupResponse] = None  # Must match ORM attribute name!

    class Config:
        from_attributes = True

class DeleteAsset(BaseModel):
    ip: str = None
    username: str = None
    password: str = None

class CommandRequestPost(BaseModel):
    command: str = None
    ip: str = None



class AssetMiniResponse(BaseModel):
    group: str
    group_color: str

    class Config:
        from_attributes = True

class CommandRequestResponse(BaseModel):
    command_id: int
    command: str
    status: str
    output: str | None = None
    duration: str
    error: str | None = None
    created_at: datetime
    asset: str           # asset name
    assetIp: str         # asset IP
    group: str           # group name
    groupColor: str      # group color

    class Config:
        from_attributes = True


class GroupBase(BaseModel):
    name: str
    color: Optional[str] = "#3b82f6"

class GroupCreate(GroupBase):
    pass

class GroupResponse(GroupBase):
    group_id: int
    created_at: datetime

    class Config:
        from_attributes = True
