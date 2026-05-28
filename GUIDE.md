# FlowTime AI — Complete User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [AI Assistant](#ai-assistant)
4. [Calendar](#calendar)
5. [Tasks](#tasks)
6. [Habits](#habits)
7. [Analytics](#analytics)
8. [Focus Mode](#focus-mode)
9. [Team Workspaces](#team-workspaces)
10. [Settings](#settings)
11. [Keyboard Shortcuts](#keyboard-shortcuts)
12. [Tips & Tricks](#tips--tricks)

---

## Getting Started

### 1. Create Your Account
1. Open **http://localhost:5175** in your browser
2. Click **"Get started"** on the landing page
3. Fill in your name, email, and password (min 8 characters)
4. Click **"Create account"** — you're in immediately

### 2. Demo Account (Quick Start)
If you want to explore with pre-loaded data:
- **Email:** `demo@flowtime.ai`
- **Password:** `Demo1234!`

### 3. First Login
After logging in you land on the **Dashboard**. The sidebar on the left gives you access to all features.

---

## Dashboard

The Dashboard is your **command center** — it shows everything important at a glance.

### What You See

| Card | What It Shows |
|------|--------------|
| **Tasks Completed** | How many tasks you've finished vs total |
| **Focus Hours** | Total deep work hours this week |
| **Habit Completion** | Your 30-day habit consistency % |
| **Productivity Score** | AI-calculated score out of 100 |

### Productivity Trend Chart
- The area chart shows your **focus hours** over the last 7 days
- Hover over any point to see exact numbers
- A rising trend means you're getting more productive

### AI Insights Panel
- Shows up to 3 AI-generated recommendations
- Click **"Generate Schedule"** to let AI plan your day
- Click **"View all"** to go to the full AI Assistant page

### Upcoming Tasks
- Lists your next 3 tasks sorted by due date
- Color-coded dots: 🔴 urgent · 🟠 high · 🟡 medium · 🔵 low
- Click **"View all"** to go to the Tasks page

### Today's Schedule
- Shows your meeting load vs focus time this week
- Progress bars fill up as you add more events
- Red alert if you have overdue tasks

---

## AI Assistant

The AI Assistant is the **most powerful feature** of FlowTime. It understands natural language and can create, schedule, and manage your tasks by just talking to it.

### Opening the AI Panel
- Click the **✨ sparkle icon** in the top header
- Or press **Ctrl + /** (Windows) / **Cmd + /** (Mac)
- The panel slides in from the right side

### What the AI Can Do

#### 1. Schedule Tasks from Natural Language
Just describe what you need to do and when:

```
"I need to eat at 8am, go to the gym at 7pm, and read before bed — schedule for tomorrow"
```

The AI will:
- **Detect** the activities (eat, gym, read)
- **Create** them as real tasks in your database
- **Schedule** them with proper time slots
- **Add them to your Calendar** automatically
- Show a **"Tasks added to calendar — tap to view"** banner

#### 2. Prioritize Your Work
```
"What should I focus on today?"
"Which tasks are most urgent?"
"I have 3 hours free — what should I work on?"
```

The AI reads your actual task list and tells you exactly what to tackle first.

#### 3. Plan a Specific Day
```
"Plan my day for 28th May"
"Schedule my tasks for next Monday"
"Create a schedule for this Friday"
```

Supports: today, tomorrow, specific dates (e.g., "June 15th"), day names ("next Tuesday")

#### 4. Get Productivity Tips
```
"Give me a productivity tip"
"How can I be more focused?"
"Help me stop procrastinating"
```

#### 5. Check Your Status
```
"How many tasks do I have?"
"Do I have any overdue tasks?"
"Show my task summary"
```

### Context-Aware Suggestions
After every AI response, **4 smart suggestions** appear below the chat. These change based on:
- What you just asked
- Your current tasks and priorities
- Whether you have urgent/overdue items

Click any suggestion chip to send it instantly.

### Chat History
- Your entire conversation is **saved automatically** to the database
- It persists across page refreshes and browser restarts
- When you reopen the panel, your previous conversation loads
- Click the **🗑️ trash icon** in the header to clear history and start fresh

### Calendar Integration
When the AI schedules tasks:
1. Tasks are created in the **Tasks** database
2. Calendar events are automatically created
3. A **blue banner** appears: *"Tasks added to calendar — tap to view"*
4. Click the banner to jump directly to the Calendar page

---

## Calendar

The Calendar gives you a **visual overview** of everything scheduled.

### Views
Switch between views using the buttons in the top-right:
- **Month** — see the whole month at a glance
- **Week** — detailed week view with time slots (default)
- **Day** — single day with hour-by-hour breakdown
- **Agenda** — list view of upcoming events

### Event Types & Colors
| Color | Type | Meaning |
|-------|------|---------|
| 🟣 Purple | Task | Work tasks scheduled by you or AI |
| 🟡 Yellow | Meeting | Meetings and calls |
| 🟢 Green | Focus | Deep work / focus blocks |
| 🔵 Cyan | Break | Rest and break times |
| 🟠 Orange | Habit | Recurring habits |
| 🩷 Pink | Personal | Personal events |
| ⚫ Gray | Blocked | Blocked/unavailable time |

### Creating Events
**Method 1 — Click and drag on the calendar:**
1. Click on any empty time slot
2. Drag to set the duration
3. A form appears — fill in the title and type
4. Click **"Create Event"**

**Method 2 — Click "New Event" button:**
1. Click the **"+ New Event"** button (top right)
2. Fill in title, type, start time, end time
3. Click **"Create Event"**

**Method 3 — Via AI Assistant:**
- Tell the AI: *"Add a meeting at 2pm tomorrow"*
- It creates the event automatically

### Editing Events
- **Click** any event to see its details
- **Drag** an event to a new time slot to reschedule
- **Resize** an event by dragging its bottom edge
- Click **"Delete"** in the detail popup to remove it

### Refreshing
- Click the **"Refresh"** button to reload events
- The calendar auto-loads events for the visible date range

---

## Tasks

Tasks is your **to-do list on steroids** — with priorities, subtasks, AI scheduling, and two views.

### Creating a Task
1. Click **"+ New Task"** button (top right)
2. Fill in:
   - **Title** (required)
   - **Description** — optional details
   - **Priority** — Low / Medium / High / Urgent
   - **Energy Level** — Low / Medium / High (used by AI for scheduling)
   - **Duration** — estimated minutes
   - **Due Date** — deadline
   - **Tags** — comma-separated labels (e.g., "work, design")
3. Click **"Create Task"**

### Task Views

**List View** (default):
- All tasks in a scrollable list
- Each task shows priority badge, duration, due date, tags
- Overdue tasks show in red

**Kanban View:**
- Tasks organized in columns: Pending → Scheduled → In Progress → Completed
- Drag tasks between columns to update status
- Great for visual workflow management

Switch between views using the **List / Kanban** toggle buttons.

### Task Actions
| Action | How |
|--------|-----|
| ✅ Complete | Click the circle on the left |
| ✏️ Edit | Click the pencil icon |
| 🗑️ Delete | Click the trash icon |
| 💬 Add comment | Open task → Comments section |
| ➕ Add subtask | Open task → Subtasks section |

### Filtering & Search
- **Search bar** — type to filter by title
- **Priority filter** — dropdown to show only specific priorities
- **Status filter** — show only pending, scheduled, etc.

### AI Scheduling
Click **"⚡ AI Schedule"** to let the AI automatically:
1. Find free time slots in your calendar
2. Match tasks to your energy levels and peak hours
3. Schedule everything optimally
4. Update task statuses to "Scheduled"

### Task Statuses
| Status | Meaning |
|--------|---------|
| **Pending** | Created but not yet scheduled |
| **Scheduled** | Has a time slot assigned |
| **In Progress** | Currently being worked on |
| **Completed** | Done ✅ |
| **Deferred** | Postponed to later |
| **Cancelled** | No longer needed |

---

## Habits

Habits helps you **build consistency** with daily, weekly, or monthly routines.

### Creating a Habit
1. Click **"+ New Habit"**
2. Choose an **icon** (⭐ 💪 📚 🧘 🏃 💧 🎯 ✍️ 🎵 🌱)
3. Fill in:
   - **Title** — e.g., "Morning Meditation"
   - **Category** — Health / Work / Learning / Fitness / Mindfulness / Personal
   - **Frequency** — Daily / Weekly / Monthly
   - **Duration** — estimated minutes
   - **Preferred Time** — Morning / Afternoon / Evening / Anytime
4. Click **"Create Habit"**

### Today's Habits
At the top of the Habits page, you see **today's habits** — the ones due today based on your frequency settings.

- Click the **circle** next to a habit to mark it complete
- A ✅ appears and the streak counter increases
- The habit moves to "completed" state for today

### Streaks
- **Current streak** — consecutive days you've completed the habit
- **Longest streak** — your personal best
- 🔥 flame icon shows your streak count
- Missing a day resets your current streak to 0

### Completion Rate
Each habit card shows a **progress bar** with your 30-day completion rate:
- 80%+ = Excellent 🟢
- 50-79% = Good 🟡
- Below 50% = Needs work 🔴

### Stats Overview
The top of the page shows:
- **Total streak days** across all habits
- **Average completion rate**
- **Active habits count**
- **Done today** count

---

## Analytics

Analytics gives you **deep insights** into your productivity patterns.

### Weekly Summary Cards
Four cards at the top show this week's:
- ⏱️ **Focus Hours** — time in deep work
- ✅ **Tasks Done** — completed tasks
- 🔥 **Habits Done** — habit completions
- 📈 **Productivity Score** — overall score

### Productivity Trend Chart
- 14-day area chart showing your productivity score and focus hours
- Hover to see exact values for any day
- Look for patterns — are you more productive on certain days?

### Time Allocation Pie Chart
Shows how you spend your time across categories:
- Purple = Tasks
- Yellow = Meetings
- Green = Focus
- Orange = Habits
- Cyan = Breaks

### Daily Task Completion Bar Chart
- Last 7 days of task completions
- Taller bars = more productive days
- Helps identify your most/least productive days of the week

### Weekly Insights
AI-generated text insights at the bottom, e.g.:
- *"Great task completion this week!"*
- *"Consider adding more focus blocks"*
- *"High meeting load — consider declining some"*

---

## Focus Mode

Focus Mode helps you do **deep, uninterrupted work** using the Pomodoro technique.

### How to Use
1. Navigate to **Focus** in the sidebar
2. Choose your mode:
   - **Focus** — 25 minutes of work (default)
   - **Short Break** — 5 minutes
   - **Long Break** — 15 minutes
3. Click **"Start"**
4. Work until the timer ends
5. Take a break, then repeat

### The Pomodoro Cycle
```
Focus (25 min) → Short Break (5 min) → Focus → Short Break → Focus → Short Break → Focus → Long Break (15 min)
```
After 4 focus sessions, take a long break.

### Stats
- **Sessions today** — how many focus sessions completed
- **Focus time** — total minutes focused today
- **Long breaks** — number of long breaks taken

### Tips for Focus Mode
- Close unnecessary browser tabs before starting
- Put your phone on Do Not Disturb
- Use the AI Assistant to plan what to work on before starting
- The circular progress ring shows time remaining visually

---

## Team Workspaces

Team Workspaces let you **collaborate** with colleagues on shared tasks and projects.

### Creating a Workspace
1. Go to **Team** in the sidebar
2. Click **"+ New Workspace"**
3. Enter a name and optional description
4. Click **"Create"** — you're automatically the Owner

### Inviting Members
1. Select your workspace from the left panel
2. Click **"Invite"** button (top right of workspace)
3. Enter the member's email address
4. Choose their role:
   - **Viewer** — can only view tasks and calendar
   - **Member** — can create and edit tasks
   - **Admin** — full access except deleting the workspace
5. Click **"Send Invite"**

> **Note:** The invited person must already have a FlowTime account.

### Roles & Permissions
| Role | View | Create/Edit | Invite | Settings |
|------|------|-------------|--------|----------|
| Owner | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ |
| Member | ✅ | ✅ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ |

### Removing Members
1. As Owner, click the **remove icon** (👤-) next to any member
2. They lose access immediately

---

## Settings

Settings lets you **personalize** FlowTime to match your work style.

### Profile
- Update your **name**
- Change your **timezone** (important for correct scheduling)
- Email cannot be changed after registration

### Appearance
Choose your theme:
- ☀️ **Light** — bright white interface
- 🌙 **Dark** — dark mode (easier on eyes at night)
- 💻 **System** — automatically matches your OS setting

### AI Settings
Control how the AI behaves:
- **Auto-schedule tasks** — AI automatically finds time slots for new tasks
- **Auto-reschedule** — AI moves missed tasks to new slots
- **Learning mode** — AI learns from your scheduling patterns over time
- **Suggestion frequency** — how often AI proactively suggests things

### Notification Preferences
Toggle on/off:
- **Email notifications** — get emails for deadlines and reminders
- **Push notifications** — browser notifications
- **In-app notifications** — notification bell in the header
- **Deadline alerts** — warnings when tasks are due soon
- **AI suggestions** — proactive AI tips

### Security
- **Change Password** — update your login password
- **Two-Factor Authentication** — add extra security (coming soon)

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Open Command Palette |
| `Ctrl + /` | Toggle AI Assistant panel |
| `Escape` | Close any open panel or modal |
| `Enter` | Send message in AI chat |

### Command Palette (`Ctrl + K`)
The command palette lets you navigate anywhere instantly:
1. Press `Ctrl + K`
2. Type what you're looking for (e.g., "tasks", "calendar", "habits")
3. Use arrow keys to navigate results
4. Press `Enter` to go there

Available commands:
- Go to Dashboard / Calendar / Tasks / Habits / Analytics / Settings
- Create new task
- Create new event
- Create new habit

---

## Notifications

### Notification Bell
- The 🔔 bell icon in the header shows unread count
- Click it to go to the Notifications page

### Notification Types
| Icon | Type | When |
|------|------|------|
| ⏰ | Task due | Task deadline approaching |
| 📅 | Task scheduled | AI scheduled a task |
| 🔥 | Habit reminder | Time to complete a habit |
| 📞 | Meeting reminder | Meeting starting soon |
| 🤖 | AI suggestion | AI has a recommendation |
| ⚠️ | Deadline alert | Task is overdue |
| 💬 | Team mention | Someone mentioned you |
| 🔔 | System | App updates |

### Managing Notifications
- Click **"Mark all read"** to clear the unread count
- Click the ✓ on individual notifications to mark as read
- Click the 🗑️ to delete a notification

---

## Tips & Tricks

### Getting the Most from AI Scheduling

**Be specific about times:**
```
✅ "Schedule: meeting at 10am, lunch at 1pm, gym at 6pm for tomorrow"
✅ "I need to review the report at 9am on June 15th"
❌ "Schedule my stuff" (too vague)
```

**Mention the date:**
```
✅ "for tomorrow"
✅ "for next Monday"  
✅ "for 28th May"
✅ "for this Friday"
```

**List multiple tasks at once:**
```
✅ "Add: breakfast at 8am, team call at 10am, code review at 2pm, exercise at 6pm — schedule for tomorrow"
```

### Productivity Workflow

**Morning routine (5 minutes):**
1. Open Dashboard — check today's overview
2. Open AI Assistant — ask *"What should I focus on today?"*
3. Click the suggested schedule to confirm
4. Start Focus Mode for your first task

**End of day (5 minutes):**
1. Go to Tasks — mark completed tasks as done
2. Go to Habits — log today's habit completions
3. Check Analytics — see your productivity score
4. Ask AI: *"Plan my tasks for tomorrow"*

### Building Good Habits
- Start with **1-2 habits** — don't add 10 at once
- Set a **specific time** (e.g., "Morning" not "Anytime")
- Keep early habits **short** (5-15 minutes)
- Check the Habits page every morning to stay accountable

### Using the Calendar Effectively
- **Color code** your events by type so you can see patterns
- Aim for **green (focus) blocks** in the morning
- Keep **yellow (meetings)** to afternoons when possible
- Add **cyan (break)** blocks — rest is productive!

### Task Management Best Practices
- Set **realistic durations** — AI uses these for scheduling
- Use **energy levels** — mark creative work as "High energy"
- Add **tags** to group related tasks (e.g., "work", "personal", "urgent")
- Use **subtasks** to break large tasks into steps
- Review and **clear completed tasks** weekly

---

## Troubleshooting

### AI says "I'm having trouble connecting"
The Gemini API has a free tier limit of 20 requests/day. The AI will automatically use a smart local fallback that still reads your real tasks and gives useful responses. Full AI resumes the next day.

### Tasks not showing on Calendar
After the AI schedules tasks, click the **"Tasks added to calendar"** banner or manually refresh the Calendar page. Events are created automatically.

### Chat history not loading
Try refreshing the page. History is saved to the database and loads on panel open. If it's empty, it means this is a fresh session.

### Can't log in
- Check your email and password are correct
- Use the **"Forgot password?"** link on the login page
- Or use the demo account: `demo@flowtime.ai` / `Demo1234!`

---

*FlowTime AI — Work smarter, not harder* 🚀
