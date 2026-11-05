
# AgileFlow – REST API Documentation

## 1. Overview

AgileFlow provides REST APIs developed using FastAPI.

Base URL:

http://127.0.0.1:8000

Interactive API documentation:

http://127.0.0.1:8000/docs

## 2. Authentication APIs

### Register User

- Method: POST
- Endpoint: `/auth/register`
- Authentication: Not required

Request body:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123"
}
```

### Login User

- Method: POST
- Endpoint: `/auth/login`
- Authentication: Not required

Request body:

```json
{
  "email": "test@example.com",
  "password": "Password123"
}
```

Returns a JWT access token.

### Get Current User

- Method: GET
- Endpoint: `/auth/me`
- Authentication: Bearer token required

## 3. Project APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/projects` | Create project |
| GET | `/projects` | Retrieve all projects |
| GET | `/projects/{project_id}` | Retrieve project by ID |
| DELETE | `/projects/{project_id}` | Delete project |

## 4. User Story APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/stories` | Create user story |
| GET | `/stories` | Retrieve user stories |
| PATCH | `/stories/{story_id}` | Update user story |
| DELETE | `/stories/{story_id}` | Delete user story |

## 5. Task APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/tasks` | Create task |
| GET | `/tasks` | Retrieve tasks |
| PATCH | `/tasks/{task_id}` | Update task |
| DELETE | `/tasks/{task_id}` | Delete task |

## 6. Report APIs

### Generate Report

- Method: POST
- Endpoint: `/reports/generate`
- Authentication: Bearer token required

Starts asynchronous report generation.

### Get Report Status

- Method: GET
- Endpoint: `/reports/{job_id}`
- Authentication: Bearer token required

Retrieves report status and generated data.

### Retry Failed Report

- Method: POST
- Endpoint: `/reports/{job_id}/retry`
- Authentication: Bearer token required

Retries a failed report generation job.

## 7. Authentication

Protected endpoints require the following HTTP header:

```text
Authorization: Bearer YOUR_ACCESS_TOKEN
```

The token is generated after successful login.

## 8. HTTP Status Codes

| Status Code | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created, where configured |
| 202 | Request accepted for background processing |
| 400 | Invalid request or duplicate registration |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource not found |
| 422 | Validation error |
| 500 | Internal server error |

Actual status codes depend on the endpoint implementation.

## 9. API Testing

APIs can be tested using:

- FastAPI Swagger UI
- Browser
- Postman
- cURL

Swagger UI provides an interactive interface for sending requests and viewing responses.
