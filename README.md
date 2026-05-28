# FlowTime — AI-Powered Calendar & Task Scheduling Platform

FlowTime is a full-stack SaaS productivity platform that intelligently schedules tasks, habits, meetings, and focus sessions using AI-driven prioritization and conflict resolution.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand + TanStack React Query |
| Calendar | FullCalendar |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + Refresh Tokens |
| AI | Google Gemini API |
| Realtime | Socket.io |
| Queue | BullMQ + Redis |
| Monorepo | npm workspaces |

## Project Structure

```
flowtime-ai/
├── apps/
│   ├── client/          # React frontend
│   └── server/          # Express backend
├── packages/
│   ├── types/           # Shared TypeScript types
│   ├── shared/          # Shared utilities
│   └── ui/              # Shared UI components
├── docker-compose.yml
└── package.json
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional, for queues)
- Gemini API key

### 1. Clone and install

```bash
git clone <repo>
cd flowtime-ai
npm install
```

### 2. Configure environment

```bash
# Backend
cp apps/server/.env.example apps/server/.env
# Edit apps/server/.env with your values

# Frontend
cp apps/client/.env.example apps/client/.env
# Edit apps/client/.env with your values
```

### 3. Seed the database

```bash
npm run seed
```

This creates:
- Demo user: `demo@flowtime.ai` / `Demo1234!`
- Admin user: `admin@flowtime.ai` / `Admin1234!`
- Sample tasks, habits, and calendar events

### 4. Start development servers

```bash
# Start both frontend and backend
npm run dev

# Or individually:
npm run dev --workspace=apps/server   # Backend on :5000
npm run dev --workspace=apps/client   # Frontend on :5173
```

## Environment Variables

### Backend (`apps/server/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/flowtime
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
GEMINI_API_KEY=your-gemini-api-key
REDIS_URI=redis://localhost:6379
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your-app-password
CLIENT_URL=http://localhost:5173
```

### Frontend (`apps/client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh tokens |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/profile` | Update profile |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (with filters) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/complete` | Mark complete |
| GET | `/api/tasks/upcoming` | Upcoming tasks |
| GET | `/api/tasks/overdue` | Overdue tasks |

### Calendar
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar/events` | Get events (date range) |
| POST | `/api/calendar/events` | Create event |
| PATCH | `/api/calendar/events/:id` | Update event |
| DELETE | `/api/calendar/events/:id` | Delete event |
| GET | `/api/calendar/events/free-slots` | Find free time slots |
| POST | `/api/calendar/events/conflicts` | Detect conflicts |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/schedule` | Generate AI schedule |
| POST | `/api/ai/chat` | Chat with AI assistant |
| GET | `/api/ai/insights` | Get productivity insights |
| GET | `/api/ai/recommendations` | Get AI recommendations |
| POST | `/api/ai/estimate-duration` | Estimate task duration |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard metrics |
| GET | `/api/analytics/productivity-trend` | Productivity trend |
| GET | `/api/analytics/time-allocation` | Time allocation |
| GET | `/api/analytics/weekly-report` | Weekly report |

## Features

### AI Scheduling Engine
The AI scheduling engine uses Gemini to:
- Automatically place tasks into optimal free calendar slots
- Consider energy levels, priorities, and deadlines
- Protect focus time and avoid meeting overload
- Provide natural language scheduling via chat

**Example AI prompts:**
- "Schedule a 2-hour deep work session tomorrow morning"
- "Move all low-priority tasks away from Friday"
- "Optimize my week for maximum focus time"

### Smart Calendar
- Day/Week/Month/Agenda views via FullCalendar
- Drag-and-drop rescheduling
- Event color coding by type
- Conflict detection
- Buffer times between meetings
- Focus time protection

### Task Management
- Kanban and list views
- Subtasks and comments
- Priority levels (Low/Medium/High/Urgent)
- Energy level requirements
- AI auto-scheduling
- Deadline warnings

### Habit Tracking
- Daily/Weekly/Monthly habits
- Streak tracking
- Completion analytics
- AI-optimized scheduling
- Habit reminders

### Analytics
- Productivity trend charts
- Time allocation pie charts
- Focus vs meeting hours
- Weekly reports with AI insights
- Burnout indicators

## Docker Deployment

```bash
# Copy and configure environment
cp apps/server/.env.example .env

# Build and start all services
docker compose up -d

# Seed the database
docker compose exec server npm run seed
```

Services:
- Frontend: http://localhost
- Backend: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

## Gemini AI Setup

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com)
2. Add to `apps/server/.env`: `GEMINI_API_KEY=your-key`
3. The AI features will automatically activate

## Google OAuth Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Add to `.env`: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

## Architecture

```
Client (React)
    ↓ HTTP/WebSocket
Express Server
    ├── Auth (JWT + Refresh Tokens)
    ├── REST API Routes
    ├── Socket.io (Realtime)
    └── Cron Jobs (Background tasks)
         ↓
    MongoDB (Primary DB)
    Redis (Cache + Sessions)
    Gemini AI (Scheduling + Chat)
```

## License

MIT — Original implementation inspired by productivity platform concepts.
