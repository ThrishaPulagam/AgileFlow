
import json
from app.database import SessionLocal
from app import models


def generate_report(job_id: int):
    db = SessionLocal()

    try:
        # Find the report job
        job = db.query(models.ReportJob).filter(
            models.ReportJob.id == job_id
        ).first()

        if not job:
            return

        # Update job status
        job.status = "Running"
        job.attempts += 1
        db.commit()

        # Collect project statistics
        total_projects = db.query(models.Project).count()
        total_stories = db.query(models.UserStory).count()
        total_tasks = db.query(models.Task).count()

        completed_tasks = db.query(models.Task).filter(
            models.Task.status == "Done"
        ).count()

        pending_tasks = db.query(models.Task).filter(
            models.Task.status == "To Do"
        ).count()

        in_progress_tasks = db.query(models.Task).filter(
            models.Task.status == "In Progress"
        ).count()

        # Prepare report
        report = {
            "total_projects": total_projects,
            "total_stories": total_stories,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "in_progress_tasks": in_progress_tasks
        }

        # Save report
        job.report_data = json.dumps(report)
        job.status = "Completed"
        job.error_message = None

        db.commit()

    except Exception as e:
        db.rollback()

        # Save failure details
        job = db.query(models.ReportJob).filter(
            models.ReportJob.id == job_id
        ).first()

        if job:
            job.status = "Failed"
            job.error_message = str(e)
            db.commit()

    finally:
        db.close()
