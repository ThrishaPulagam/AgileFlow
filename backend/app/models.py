
from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

# 1. Projects table
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    status = Column(String(30), default="Active")

    stories = relationship(
        "UserStory",
        back_populates="project",
        cascade="all, delete-orphan"
    )


# 2. User Stories table
class UserStory(Base):
    __tablename__ = "user_stories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(String(30), default="To Do")
    priority = Column(String(20), default="Medium")

    project_id = Column(Integer, ForeignKey("projects.id"))

    project = relationship("Project", back_populates="stories")

    tasks = relationship(
        "Task",
        back_populates="story",
        cascade="all, delete-orphan"
    )


# 3. Tasks table
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    status = Column(String(30), default="To Do")
    priority = Column(String(20), default="Medium")

    story_id = Column(Integer, ForeignKey("user_stories.id"))

    story = relationship("UserStory", back_populates="tasks")


# 4. Team Members table
class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    role = Column(String(50), default="Developer")


# 5. Report Jobs table
class ReportJob(Base):
    __tablename__ = "report_jobs"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(30), default="Pending")
    attempts = Column(Integer, default=0)
    report_data = Column(Text)
    error_message = Column(Text)


# =====================================
# USER AUTHENTICATION MODEL
# =====================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(
        String(150),
        unique=True,
        index=True,
        nullable=False
    )

    hashed_password = Column(String(255), nullable=False)

    is_active = Column(Boolean, default=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
