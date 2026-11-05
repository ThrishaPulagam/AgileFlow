
# AgileFlow – Team Project Management System

## 1. Project Overview

AgileFlow is a web-based project management application designed to help teams organize projects, manage user stories, track tasks, and generate project reports.

The application follows an Agile-inspired workflow and provides a simple interface for managing project activities.

## 2. Features

- User registration and login
- Password hashing and JWT-based authentication
- Project creation, viewing, and deletion
- User story management
- Task creation, updating, and deletion
- Task status tracking
- Asynchronous report generation
- Report status monitoring
- SQLite database persistence
- Interactive dashboard
- REST API documentation using Swagger UI

## 3. Technology Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- PyJWT
- pwdlib with Argon2

### Database
- SQLite

## 4. Project Structure

```text
AgileFlow/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   ├── routes.py
│   │   ├── auth.py
│   │   └── background.py
│   ├── agileflow.db
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── style.css
│   ├── auth.css
│   ├── script.js
│   └── auth.js
│
└── README.md
```

## 5. Installation and Setup

### Step 1: Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd AgileFlow
```

### Step 2: Create a virtual environment

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\activate
```

### Step 3: Install dependencies

```bash
pip install -r backend/requirements.txt
```

### Step 4: Configure the JWT secret key

In PowerShell:

```powershell
$env:AGILEFLOW_SECRET_KEY = "YOUR_LONG_RANDOM_SECRET_KEY"
```

Use a private, randomly generated secret. Do not commit it to GitHub.

### Step 5: Start the backend

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

Backend URL:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs

### Step 6: Start the frontend

Open another terminal:

```powershell
cd frontend
python -m http.server 5500
```

Open the application:

http://127.0.0.1:5500/signup.html

Register an account and log in to access the dashboard.

## 6. API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/register | Register a user |
| POST | /auth/login | Authenticate a user |
| GET | /auth/me | Get current user |
| POST | /projects | Create a project |
| GET | /projects | List projects |
| GET | /projects/{id} | Get project details |
| DELETE | /projects/{id} | Delete a project |
| POST | /stories | Create a user story |
| GET | /stories | List user stories |
| PATCH | /stories/{id} | Update a story |
| DELETE | /stories/{id} | Delete a story |
| POST | /tasks | Create a task |
| GET | /tasks | List tasks |
| PATCH | /tasks/{id} | Update a task |
| DELETE | /tasks/{id} | Delete a task |
| POST | /reports/generate | Generate a report |
| GET | /reports/{id} | Check report status |
| POST | /reports/{id}/retry | Retry a failed report |

## 7. Authentication and Security

- Passwords are hashed using Argon2.
- JWT access tokens are used for authentication.
- Protected API endpoints require a valid bearer token.
- The frontend stores the access token in session storage.
- The JWT secret is configured through an environment variable.

## 8. Asynchronous Processing

AgileFlow uses FastAPI BackgroundTasks to generate project reports asynchronously.

The report workflow includes:
1. A report generation request is received.
2. A report job is created with a pending status.
3. Background processing calculates project statistics.
4. The report is marked completed or failed.
5. The client can check the report status using the report ID.

Note: The current background task implementation runs in the application process and is not a durable job queue.

## 9. Database

SQLite is used for persistent storage.

The application contains database models for:
- Users
- Projects
- User Stories
- Tasks
- Team Members
- Report Jobs

## 10. Future Enhancements

- Role-based access control
- Project ownership and user-specific data access
- Team collaboration
- Task assignment and deadlines
- Notifications
- Advanced analytics and charts
- Durable background processing using Celery and Redis
- Deployment to a cloud platform

## 11. AI Usage

AI tools were used as development assistance for understanding concepts, debugging errors, improving code structure, and preparing documentation.

The application was implemented, tested, and reviewed as part of the development process.

## 12. Author

Developed as a full-stack project management application for the KPIT assignment.
