
# AgileFlow – Database Schema Documentation

## 1. Database Overview

AgileFlow uses SQLite as its relational database and SQLAlchemy ORM for database operations.

- Database: SQLite
- Database file: agileflow.db
- ORM: SQLAlchemy

## 2. Database Tables

### 2.1 Projects

Table name: `projects`

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | Integer | Primary Key, Indexed | Unique project ID |
| name | String(100) | NOT NULL | Project name |
| description | Text | Nullable | Project description |
| status | String(30) | Default: Active | Project status |

Relationship:
- One project can have multiple user stories.
- Deleting a project deletes its associated stories and tasks through ORM cascade configuration.

### 2.2 User Stories

Table name: `user_stories`

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | Integer | Primary Key, Indexed | Unique story ID |
| title | String(200) | NOT NULL | Story title |
| description | Text | Nullable | Story description |
| status | String(30) | Default: To Do | Story status |
| priority | String(20) | Default: Medium | Story priority |
| project_id | Integer | Foreign Key | References projects.id |

Relationship:
- Each user story belongs to a project when project_id is provided.
- One user story can contain multiple tasks.

### 2.3 Tasks

Table name: `tasks`

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | Integer | Primary Key, Indexed | Unique task ID |
| title | String(200) | NOT NULL | Task title |
| status | String(30) | Default: To Do | Task status |
| priority | String(20) | Default: Medium | Task priority |
| story_id | Integer | Foreign Key | References user_stories.id |

Relationship:
- Each task belongs to a user story when story_id is provided.

### 2.4 Team Members

Table name: `team_members`

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | Integer | Primary Key, Indexed | Unique member ID |
| name | String(100) | NOT NULL | Member name |
| email | String(150) | UNIQUE, NOT NULL | Member email |
| role | String(50) | Default: Developer | Member role |

### 2.5 Report Jobs

Table name: `report_jobs`

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | Integer | Primary Key, Indexed | Unique report job ID |
| status | String(30) | Default: Pending | Job status |
| attempts | Integer | Default: 0 | Number of attempts |
| report_data | Text | Nullable | Generated report data |
| error_message | Text | Nullable | Error details if generation fails |

### 2.6 Users

Table name: `users`

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | Integer | Primary Key, Indexed | Unique user ID |
| name | String(100) | NOT NULL | User name |
| email | String(150) | UNIQUE, NOT NULL, Indexed | User email |
| hashed_password | String(255) | NOT NULL | Hashed password |
| is_active | Boolean | Default: True | Account status |
| created_at | DateTime | Server default: Current time | Account creation time |

## 3. Entity Relationship Diagram

```text
+------------------+
|     PROJECTS     |
+------------------+
| PK id            |
| name             |
| description      |
| status           |
+------------------+
         |
         | 1 : Many
         |
         v
+------------------+
|   USER_STORIES   |
+------------------+
| PK id            |
| title            |
| description      |
| status           |
| priority         |
| FK project_id    |
+------------------+
         |
         | 1 : Many
         |
         v
+------------------+
|      TASKS       |
+------------------+
| PK id            |
| title            |
| status           |
| priority         |
| FK story_id      |
+------------------+


+------------------+    +------------------+
|   TEAM_MEMBERS   |    |    REPORT_JOBS   |
+------------------+    +------------------+
| PK id            |    | PK id            |
| name             |    | status           |
| email            |    | attempts         |
| role             |    | report_data      |
+------------------+    | error_message    |
                        +------------------+

+------------------+
|      USERS       |
+------------------+
| PK id            |
| name             |
| email            |
| hashed_password |
| is_active        |
| created_at       |
+------------------+
```

## 4. Relationships and Constraints

- One project can have multiple user stories.
- One user story can have multiple tasks.
- `project_id` references `projects.id`.
- `story_id` references `user_stories.id`.
- Project and story relationships use SQLAlchemy cascade delete-orphan configuration.
- Team members and users are independent tables.
- Report jobs store report generation status and results.
- User accounts are not currently linked to individual projects.

Note: The project_id and story_id columns are nullable in the current SQLAlchemy models because nullable=False has not been specified.

## 5. Database Operations

SQLAlchemy ORM manages:

- Database table creation.
- Record insertion.
- Record retrieval.
- Record updates.
- Record deletion.
- Database sessions.

## 6. Data Persistence

The SQLite database stores application data in `backend/agileflow.db` when the backend is started from the backend directory.

Data persists after restarting the application.
