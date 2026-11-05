from fastapi import BackgroundTasks
from app.background import generate_report
import json

from app.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(
    dependencies=[Depends(get_current_user)]
)

# ---------------- PROJECT APIs ----------------

@router.post("/projects")
def create_project(data: schemas.ProjectCreate,
                   db: Session = Depends(get_db)):

    project = models.Project(
        name=data.name,
        description=data.description,
        status=data.status
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project


@router.get("/projects")
def get_projects(db: Session = Depends(get_db)):

    return db.query(models.Project).all()


@router.get("/projects/{project_id}")
def get_project(project_id: int,
                db: Session = Depends(get_db)):

    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project


@router.delete("/projects/{project_id}")
def delete_project(project_id: int,
                   db: Session = Depends(get_db)):

    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()

    return {"message": "Project deleted successfully"}


# ---------------- USER STORY APIs ----------------

@router.post("/stories")
def create_story(data: schemas.StoryCreate,
                 db: Session = Depends(get_db)):

    project = db.query(models.Project).filter(
        models.Project.id == data.project_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    story = models.UserStory(
        title=data.title,
        description=data.description,
        status=data.status,
        priority=data.priority,
        project_id=data.project_id
    )

    db.add(story)
    db.commit()
    db.refresh(story)

    return story


@router.get("/stories")
def get_stories(db: Session = Depends(get_db)):

    return db.query(models.UserStory).all()


# ---------------- TASK APIs ----------------

@router.post("/tasks")
def create_task(data: schemas.TaskCreate,
                db: Session = Depends(get_db)):

    story = db.query(models.UserStory).filter(
        models.UserStory.id == data.story_id
    ).first()

    if not story:
        raise HTTPException(status_code=404, detail="User story not found")

    task = models.Task(
        title=data.title,
        status=data.status,
        priority=data.priority,
        story_id=data.story_id
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.get("/tasks")
def get_tasks(db: Session = Depends(get_db)):

    return db.query(models.Task).all()


@router.patch("/tasks/{task_id}")
def update_task(task_id: int,
                data: schemas.TaskUpdate,
                db: Session = Depends(get_db)):

    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)

    return task


@router.delete("/tasks/{task_id}")
def delete_task(task_id: int,
                db: Session = Depends(get_db)):

    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}

# ---------------- REPORT APIs ----------------

@router.post("/reports/generate", status_code=202)
def create_report(
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db)
):
    # Create a new report job
    job = models.ReportJob(status="Pending")

    db.add(job)
    db.commit()
    db.refresh(job)

    # Start background processing
    background_tasks.add_task(generate_report, job.id)

    return {
        "message": "Report generation started",
        "job_id": job.id,
        "status": job.status
    }


@router.get("/reports/{job_id}")
def get_report(
        job_id: int,
        db: Session = Depends(get_db)
):
    job = db.query(models.ReportJob).filter(
        models.ReportJob.id == job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Report job not found"
        )

    return {
        "job_id": job.id,
        "status": job.status,
        "attempts": job.attempts,
        "report": json.loads(job.report_data)
        if job.report_data else None,
        "error": job.error_message
    }


@router.post("/reports/{job_id}/retry", status_code=202)
def retry_report(
        job_id: int,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db)
):
    job = db.query(models.ReportJob).filter(
        models.ReportJob.id == job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Report job not found"
        )

    if job.status != "Failed":
        raise HTTPException(
            status_code=400,
            detail="Only failed reports can be retried"
        )

    job.status = "Pending"
    job.error_message = None
    job.report_data = None

    db.commit()

    background_tasks.add_task(generate_report, job.id)

    return {
        "message": "Report retry started",
        "job_id": job.id,
        "status": job.status
    }

# Update a User Story
@router.patch("/stories/{story_id}")
def update_story(
        story_id: int,
        story: schemas.TaskUpdate,
        db: Session = Depends(get_db)
):
    db_story = db.query(models.UserStory).filter(
        models.UserStory.id == story_id
    ).first()

    if not db_story:
        raise HTTPException(status_code=404, detail="Story not found")

    update_data = story.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_story, key, value)

    db.commit()
    db.refresh(db_story)

    return db_story


# Delete a User Story
@router.delete("/stories/{story_id}")
def delete_story(story_id: int, db: Session = Depends(get_db)):
    db_story = db.query(models.UserStory).filter(
        models.UserStory.id == story_id
    ).first()

    if not db_story:
        raise HTTPException(status_code=404, detail="Story not found")

    db.delete(db_story)
    db.commit()

    return {"message": "User Story deleted successfully"}