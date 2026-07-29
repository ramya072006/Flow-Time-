# FlowTime API Documentation

## Overview

**Base URL**: `https://api.flowtime.app/api`  
**Version**: v1.0  
**Format**: JSON  
**Authentication**: Bearer Token (JWT)

---

## Authentication

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <accessToken>
```

---

## Endpoints

### Auth

#### POST /auth/register
Register a new user.

**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!",
  "timezone": "America/New_York"
}
```

**Response** `201`:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "timezone": "America/New_York"
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```

---

#### POST /auth/login
Login with existing credentials.

**Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "Jane Doe", "email": "..." },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```

**Errors**:
- `401` - Invalid credentials
- `429` - Too many attempts

---

#### POST /auth/logout
Logout and invalidate refresh token.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{ "refreshToken": "eyJhbGciOi..." }
```

**Response** `200`: `{ "success": true }`

---

#### POST /auth/refresh
Refresh access token.

**Request Body**:
```json
{ "refreshToken": "eyJhbGciOi..." }
```

**Response** `200`:
```json
{
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

---

#### GET /auth/me
Get current user profile.

**Response** `200`:
```json
{
  "data": {
    "_id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "timezone": "America/New_York",
    "workHours": { "start": "09:00", "end": "17:00", "days": [1,2,3,4,5] },
    "productivityPreferences": {
      "peakHours": ["morning"],
      "preferredFocusDuration": 25,
      "breakDuration": 5,
      "deepWorkBlocks": 3
    }
  }
}
```

---

#### POST /auth/forgot-password
Send password reset email.

**Request Body**:
```json
{ "email": "jane@example.com" }
```

**Response** `200`: `{ "success": true, "message": "If that email exists, a reset link has been sent" }`

---

#### POST /auth/reset-password
Reset password with token.

**Request Body**:
```json
{
  "token": "reset_token_here",
  "password": "NewPassword123!"
}
```

**Response** `200`: `{ "success": true }`

---

### Tasks

#### GET /tasks
Fetch all tasks with optional filters.

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| status | string | pending, scheduled, in_progress, completed |
| priority | string | low, medium, high, urgent |
| category | string | Filter by category |
| tags | string | Comma-separated tag list |
| search | string | Search in title/description |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| sortBy | string | createdAt, dueDate, priority |
| sortOrder | string | asc, desc |

**Response** `200`:
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3...",
      "title": "Design landing page",
      "description": "Create hero section",
      "status": "pending",
      "priority": "high",
      "estimatedDuration": 120,
      "dueDate": "2025-02-01T10:00:00Z",
      "tags": ["design", "frontend"],
      "category": "work",
      "energyRequired": "high",
      "subtasks": [],
      "scheduledStart": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

#### POST /tasks
Create a new task.

**Request Body**:
```json
{
  "title": "Design landing page",
  "description": "Create hero section with animations",
  "priority": "high",
  "estimatedDuration": 120,
  "dueDate": "2025-02-01T10:00:00Z",
  "energyRequired": "high",
  "tags": ["design", "frontend"],
  "category": "work"
}
```

**Response** `201`:
```json
{
  "success": true,
  "message": "Task created",
  "data": { "_id": "...", "title": "Design landing page", ... }
}
```

---

#### GET /tasks/:id
Get a single task by ID.

**Response** `200`: Task object

---

#### PATCH /tasks/:id
Update a task.

**Request Body** (partial update):
```json
{
  "title": "Updated title",
  "priority": "urgent",
  "status": "in_progress"
}
```

**Response** `200`: Updated task object

---

#### DELETE /tasks/:id
Delete a task.

**Response** `200`: `{ "success": true, "message": "Task deleted" }`

---

#### POST /tasks/:id/complete
Mark task as completed.

**Request Body**:
```json
{ "actualDuration": 95 }
```

**Response** `200`: Completed task object

---

#### POST /tasks/:id/subtasks
Add a subtask.

**Request Body**:
```json
{ "title": "Create wireframe" }
```

---

#### PATCH /tasks/:id/subtasks/:subtaskId/toggle
Toggle subtask completion.

---

#### GET /tasks/upcoming
Get upcoming tasks.

**Query**: `?days=7` (default 7)

---

#### GET /tasks/overdue
Get overdue tasks.

---

### Habits

#### GET /habits
Get all habits for user.

**Response** `200`:
```json
{
  "data": [
    {
      "_id": "...",
      "title": "Morning meditation",
      "category": "mindfulness",
      "frequency": "daily",
      "estimatedDuration": 20,
      "streak": 15,
      "longestStreak": 30,
      "completionRate": 85,
      "color": "#6366f1",
      "icon": "🧘",
      "isActive": true,
      "completions": [
        { "date": "2025-01-28T00:00:00Z", "completed": true }
      ]
    }
  ]
}
```

---

#### POST /habits
Create a new habit.

**Request Body**:
```json
{
  "title": "Morning meditation",
  "category": "mindfulness",
  "frequency": "daily",
  "estimatedDuration": 20,
  "preferredTime": "morning",
  "icon": "🧘",
  "color": "#6366f1"
}
```

---

#### GET /habits/today
Get today's habits.

---

#### POST /habits/:id/log
Log habit completion.

**Request Body**:
```json
{
  "completed": true,
  "duration": 22,
  "notes": "Great session today"
}
```

---

#### GET /habits/:id/metrics
Get habit metrics and statistics.

**Response** `200`:
```json
{
  "data": {
    "streak": 15,
    "longestStreak": 30,
    "completionRate": 85,
    "totalCompletions": 120,
    "last30Days": [ ... ],
    "weeklyAverage": 6.5
  }
}
```

---

### Analytics

#### GET /analytics/dashboard
Get dashboard analytics summary.

**Response** `200`:
```json
{
  "data": {
    "tasks": {
      "total": 45,
      "completed": 32,
      "pending": 10,
      "overdue": 3
    },
    "focusHours": 24,
    "meetingHours": 8,
    "habitCompletionRate": 87,
    "productivityScore": 78,
    "taskCompletionRate": 71
  }
}
```

---

#### GET /analytics/productivity-trend
Get productivity trend data.

**Query**: `?days=7` or `?days=30`

**Response** `200`:
```json
{
  "data": [
    { "date": "2025-01-22", "tasksCompleted": 5, "focusHours": 4 },
    { "date": "2025-01-23", "tasksCompleted": 3, "focusHours": 3.5 }
  ]
}
```

---

### AI

#### POST /ai/schedule
Trigger AI task scheduling.

**Response** `200`:
```json
{
  "data": {
    "scheduledTasks": [
      { "_id": "...", "title": "...", "scheduledStart": "..." }
    ],
    "message": "Scheduled 8 tasks"
  }
}
```

---

#### GET /ai/recommendations
Get AI recommendations.

**Response** `200`:
```json
{
  "data": [
    {
      "_id": "...",
      "title": "Take a break",
      "content": "You've been working for 3 hours. A short break improves focus.",
      "recommendationType": "break",
      "score": 92
    }
  ]
}
```

---

#### POST /ai/chat
Chat with AI assistant.

**Request Body**:
```json
{
  "message": "What should I focus on today?",
  "conversationId": "optional_conversation_id"
}
```

**Response** `200`:
```json
{
  "data": {
    "reply": "Based on your schedule, I recommend focusing on...",
    "conversationId": "conv_123"
  }
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/expired token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate email) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## Rate Limits

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| Auth endpoints | 10 req | 15 min |
| Task endpoints | 100 req | 1 min |
| Habit endpoints | 100 req | 1 min |
| AI endpoints | 20 req | 1 min |
| Analytics | 50 req | 1 min |

---

## Pagination

Paginated responses include:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

Use `?page=2&limit=10` query params to paginate.

---

## WebSocket Events

**Connection**: `ws://api.flowtime.app/socket`

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_room` | `{ userId }` | Join user room |
| `task_update` | `{ taskId, data }` | Real-time task update |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `notification` | `{ type, message }` | Push notification |
| `task_scheduled` | `{ taskId }` | AI scheduled a task |
| `recommendation` | `{ title, content }` | New AI insight |
