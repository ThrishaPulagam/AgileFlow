
from pydantic import BaseModel
from typing import Optional


# PROJECT SCHEMAS

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "Active"


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


# USER STORY SCHEMAS

class StoryCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "To Do"
    priority: str = "Medium"
    project_id: int


class StoryResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    project_id: int

    class Config:
        from_attributes = True


# TASK SCHEMAS

class TaskCreate(BaseModel):
    title: str
    status: str = "To Do"
    priority: str = "Medium"
    story_id: int


class TaskResponse(BaseModel):
    id: int
    title: str
    status: str
    priority: str
    story_id: int

    class Config:
        from_attributes = True


# TASK UPDATE SCHEMA

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None

from pydantic import BaseModel, Field


# User registration
class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str
    password: str = Field(min_length=8, max_length=128)


# User login
class UserLogin(BaseModel):
    email: str
    password: str


# User details returned by the API
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool

    class Config:
        from_attributes = True


# JWT authentication response
class Token(BaseModel):
    access_token: str
    token_type: str