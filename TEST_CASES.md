# FlowTime - Comprehensive Test Cases (200+)

## Table of Contents
1. [Authentication Tests (30 cases)](#authentication-tests)
2. [Task Management Tests (50 cases)](#task-management-tests)
3. [Habit Tracking Tests (30 cases)](#habit-tracking-tests)
4. [Calendar & Scheduling Tests (25 cases)](#calendar-tests)
5. [AI & Automation Tests (20 cases)](#ai-tests)
6. [Analytics & Reporting Tests (15 cases)](#analytics-tests)
7. [UI/UX & Accessibility Tests (30 cases)](#ui-tests)

---

## Authentication Tests

### Registration Tests (10 cases)
1. **TC-AUTH-001**: User can register with valid name, email, and password
2. **TC-AUTH-002**: Registration fails with invalid email format
3. **TC-AUTH-003**: Registration fails with password less than 8 characters
4. **TC-AUTH-004**: Registration fails with duplicate email
5. **TC-AUTH-005**: User receives verification email after registration
6. **TC-AUTH-006**: Registration fails without required fields
7. **TC-AUTH-007**: Registration fails with SQL injection attempt in name
8. **TC-AUTH-008**: Registration succeeds with special characters in name
9. **TC-AUTH-009**: User account created with default preferences
10. **TC-AUTH-010**: Registration rate limiting prevents spam accounts

### Login Tests (10 cases)
11. **TC-AUTH-011**: User can login with valid credentials
12. **TC-AUTH-012**: Login fails with incorrect password
13. **TC-AUTH-013**: Login fails with non-existent email
14. **TC-AUTH-014**: Access token generated on successful login
15. **TC-AUTH-015**: Refresh token generated and stored
16. **TC-AUTH-016**: Login fails after 5 failed attempts (rate limiting)
17. **TC-AUTH-017**: Login works with email case insensitive
18. **TC-AUTH-018**: User redirected to dashboard after login
19. **TC-AUTH-019**: Login state persists in localStorage
20. **TC-AUTH-020**: Login fails with empty credentials

### Password Management Tests (5 cases)
21. **TC-AUTH-021**: User can request password reset
22. **TC-AUTH-022**: Password reset email sent with valid token
23. **TC-AUTH-023**: User can reset password with valid token
24. **TC-AUTH-024**: Password reset fails with expired token
25. **TC-AUTH-025**: Password reset fails with invalid token

### Session Management Tests (5 cases)
26. **TC-AUTH-026**: User can logout successfully
27. **TC-AUTH-027**: Tokens cleared on logout
28. **TC-AUTH-028**: Access token refresh works automatically
29. **TC-AUTH-029**: Session expires after token expiration
30. **TC-AUTH-030**: User redirected to login when session expires

---

## Task Management Tests

### Task Creation Tests (15 cases)
31. **TC-TASK-001**: Create task with all required fields
32. **TC-TASK-002**: Create task with optional description
33. **TC-TASK-003**: Create task with tags
34. **TC-TASK-004**: Create task with due date
35. **TC-TASK-005**: Create task with priority (low/medium/high/urgent)
36. **TC-TASK-006**: Create task with estimated duration
37. **TC-TASK-007**: Create task with energy level requirement
38. **TC-TASK-008**: Task creation fails without title
39. **TC-TASK-009**: Task creation fails with title > 200 characters
40. **TC-TASK-010**: Task created with default status 'pending'
41. **TC-TASK-011**: Task creation succeeds with multiple tags
42. **TC-TASK-012**: Task creation with past due date shows warning
43. **TC-TASK-013**: Task creation sanitizes XSS in title
44. **TC-TASK-014**: Task creation allows markdown in description
45. **TC-TASK-015**: Task auto-assigned to current user

### Task Retrieval Tests (10 cases)
46. **TC-TASK-016**: Fetch all tasks for user
47. **TC-TASK-017**: Fetch tasks filtered by status
48. **TC-TASK-018**: Fetch tasks filtered by priority
49. **TC-TASK-019**: Fetch tasks with search query
50. **TC-TASK-020**: Fetch tasks with pagination
51. **TC-TASK-021**: Fetch tasks sorted by due date
52. **TC-TASK-022**: Fetch tasks sorted by priority
53. **TC-TASK-023**: Fetch upcoming tasks (next 7 days)
54. **TC-TASK-024**: Fetch overdue tasks
55. **TC-TASK-025**: Task list shows correct count

### Task Update Tests (10 cases)
56. **TC-TASK-026**: Update task title
57. **TC-TASK-027**: Update task status
58. **TC-TASK-028**: Update task priority
59. **TC-TASK-029**: Update task due date
60. **TC-TASK-030**: Update task tags
61. **TC-TASK-031**: Update fails for non-owner user
62. **TC-TASK-032**: Update validates required fields
63. **TC-TASK-033**: Update task with partial data
64. **TC-TASK-034**: Update task timestamp updated correctly
65. **TC-TASK-035**: Update task triggers notification

### Task Completion Tests (8 cases)
66. **TC-TASK-036**: Mark task as completed
67. **TC-TASK-037**: Completed task shows completion timestamp
68. **TC-TASK-038**: Completed task updates analytics
69. **TC-TASK-039**: Cannot complete task twice
70. **TC-TASK-040**: Completed task with actual duration recorded
71. **TC-TASK-041**: Completion triggers celebration UI
72. **TC-TASK-042**: Completion updates user productivity score
73. **TC-TASK-043**: Undo task completion restores status

### Task Deletion Tests (5 cases)
74. **TC-TASK-044**: Delete task successfully
75. **TC-TASK-045**: Delete fails for non-owner
76. **TC-TASK-046**: Deleted task removed from list
77. **TC-TASK-047**: Soft delete preserves data
78. **TC-TASK-048**: Bulk delete multiple tasks

### Subtask Tests (7 cases)
79. **TC-TASK-049**: Add subtask to task
80. **TC-TASK-050**: Mark subtask as complete
81. **TC-TASK-051**: Delete subtask
82. **TC-TASK-052**: Subtask progress updates parent task
83. **TC-TASK-053**: Subtask completion percentage shown
84. **TC-TASK-054**: Reorder subtasks
85. **TC-TASK-055**: Cannot add empty subtask

---

## Habit Tracking Tests

### Habit Creation Tests (10 cases)
86. **TC-HABIT-001**: Create habit with title and icon
87. **TC-HABIT-002**: Create habit with frequency (daily/weekly/monthly)
88. **TC-HABIT-003**: Create habit with category
89. **TC-HABIT-004**: Create habit with estimated duration
90. **TC-HABIT-005**: Create habit with preferred time
91. **TC-HABIT-006**: Create habit with custom color
92. **TC-HABIT-007**: Habit creation fails without title
93. **TC-HABIT-008**: Default icon assigned if not specified
94. **TC-HABIT-009**: Habit created with streak 0
95. **TC-HABIT-010**: Habit added to today's list

### Habit Logging Tests (10 cases)
96. **TC-HABIT-011**: Log habit completion for today
97. **TC-HABIT-012**: Log habit as incomplete
98. **TC-HABIT-013**: Streak increments on daily completion
99. **TC-HABIT-014**: Streak resets on missed day
100. **TC-HABIT-015**: Completion rate updated correctly
101. **TC-HABIT-016**: Cannot log same habit twice in one day
102. **TC-HABIT-017**: Log habit with custom duration
103. **TC-HABIT-018**: Log habit with notes
104. **TC-HABIT-019**: Logging updates analytics
105. **TC-HABIT-020**: Logging shows success notification

### Habit Metrics Tests (10 cases)
106. **TC-HABIT-021**: View habit streak counter
107. **TC-HABIT-022**: View longest streak
108. **TC-HABIT-023**: View completion rate percentage
109. **TC-HABIT-024**: View total completions count
110. **TC-HABIT-025**: View 30-day habit history
111. **TC-HABIT-026**: View habit calendar heatmap
112. **TC-HABIT-027**: Compare habits performance
113. **TC-HABIT-028**: Export habit data
114. **TC-HABIT-029**: Habit statistics accuracy validation
115. **TC-HABIT-030**: Timezone handling for habit logging

---

## Calendar & Scheduling Tests

### Calendar Event Tests (10 cases)
116. **TC-CAL-001**: Create calendar event
117. **TC-CAL-002**: Create recurring event
118. **TC-CAL-003**: Create all-day event
119. **TC-CAL-004**: View events in day view
120. **TC-CAL-005**: View events in week view
121. **TC-CAL-006**: View events in month view
122. **TC-CAL-007**: Edit calendar event
123. **TC-CAL-008**: Delete calendar event
124. **TC-CAL-009**: Event color coding by type
125. **TC-CAL-010**: Drag and drop event to reschedule

### AI Scheduling Tests (10 cases)
126. **TC-CAL-011**: AI suggests optimal task schedule
127. **TC-CAL-012**: AI respects user work hours
128. **TC-CAL-013**: AI considers energy levels
129. **TC-CAL-014**: AI schedules tasks by priority
130. **TC-CAL-015**: AI avoids scheduling conflicts
131. **TC-CAL-016**: AI schedules focus blocks
132. **TC-CAL-017**: AI suggests break times
133. **TC-CAL-018**: Auto-reschedule on task delay
134. **TC-CAL-019**: AI learns from user behavior
135. **TC-CAL-020**: AI respects protected time blocks

### Time Management Tests (5 cases)
136. **TC-CAL-021**: View total scheduled hours
137. **TC-CAL-022**: View free time slots
138. **TC-CAL-023**: Time conflict detection
139. **TC-CAL-024**: Buffer time between events
140. **TC-CAL-025**: Timezone conversion for events

---

## AI & Automation Tests

### AI Recommendations Tests (10 cases)
141. **TC-AI-001**: Generate task recommendations
142. **TC-AI-002**: AI suggests break times
143. **TC-AI-003**: AI prioritizes urgent tasks
144. **TC-AI-004**: AI detects productivity patterns
145. **TC-AI-005**: AI suggests habit improvements
146. **TC-AI-006**: AI provides daily summary
147. **TC-AI-007**: AI recommendations based on energy
148. **TC-AI-008**: AI learns from task completion times
149. **TC-AI-009**: AI suggests task delegation
150. **TC-AI-010**: AI recommendation confidence score

### AI Assistant Tests (10 cases)
151. **TC-AI-011**: Chat with AI assistant
152. **TC-AI-012**: AI answers productivity questions
153. **TC-AI-013**: AI creates tasks from conversation
154. **TC-AI-014**: AI analyzes workload
155. **TC-AI-015**: AI suggests time-saving tips
156. **TC-AI-016**: AI chat history preserved
157. **TC-AI-017**: AI context awareness
158. **TC-AI-018**: AI error handling
159. **TC-AI-019**: AI response streaming
160. **TC-AI-020**: AI feedback collection

---

## Analytics & Reporting Tests

### Dashboard Analytics Tests (8 cases)
161. **TC-ANAL-001**: View total tasks completed
162. **TC-ANAL-002**: View task completion rate
163. **TC-ANAL-003**: View focus hours this week
164. **TC-ANAL-004**: View productivity score
165. **TC-ANAL-005**: View habit completion rate
166. **TC-ANAL-006**: View overdue tasks count
167. **TC-ANAL-007**: View weekly productivity trend
168. **TC-ANAL-008**: Dashboard loads within 2 seconds

### Productivity Reports Tests (7 cases)
169. **TC-ANAL-009**: Generate weekly report
170. **TC-ANAL-010**: Generate monthly report
171. **TC-ANAL-011**: Export report as PDF
172. **TC-ANAL-012**: Time spent by category
173. **TC-ANAL-013**: Most productive hours
174. **TC-ANAL-014**: Task velocity metrics
175. **TC-ANAL-015**: Goal achievement tracking

---

## UI/UX & Accessibility Tests

### Responsive Design Tests (8 cases)
176. **TC-UI-001**: App renders correctly on mobile (320px)
177. **TC-UI-002**: App renders correctly on tablet (768px)
178. **TC-UI-003**: App renders correctly on desktop (1920px)
179. **TC-UI-004**: Navigation menu collapses on mobile
180. **TC-UI-005**: Touch gestures work on mobile
181. **TC-UI-006**: Sidebar responsive behavior
182. **TC-UI-007**: Charts responsive on all screens
183. **TC-UI-008**: Modals responsive on mobile

### Theme & Appearance Tests (5 cases)
184. **TC-UI-009**: Dark mode toggle works
185. **TC-UI-010**: Light mode toggle works
186. **TC-UI-011**: Theme persists on refresh
187. **TC-UI-012**: System theme preference detected
188. **TC-UI-013**: Colors meet WCAG contrast ratios

### Accessibility Tests (10 cases)
189. **TC-A11Y-001**: All images have alt text
190. **TC-A11Y-002**: Form inputs have labels
191. **TC-A11Y-003**: Keyboard navigation works
192. **TC-A11Y-004**: Focus indicators visible
193. **TC-A11Y-005**: Screen reader announces actions
194. **TC-A11Y-006**: ARIA labels present
195. **TC-A11Y-007**: Color not sole information carrier
196. **TC-A11Y-008**: Text scalable to 200%
197. **TC-A11Y-009**: Skip to main content link
198. **TC-A11Y-010**: Error messages announced

### Performance Tests (7 cases)
199. **TC-PERF-001**: Initial page load < 3 seconds
200. **TC-PERF-002**: Task list renders < 500ms
201. **TC-PERF-003**: Search results < 200ms
202. **TC-PERF-004**: Images lazy loaded
203. **TC-PERF-005**: Bundle size < 500KB
204. **TC-PERF-006**: API responses cached
205. **TC-PERF-007**: Infinite scroll pagination

---

## Additional Test Categories

### Security Tests (15 cases)
206. **TC-SEC-001**: XSS prevention in task titles
207. **TC-SEC-002**: SQL injection prevention
208. **TC-SEC-003**: CSRF token validation
209. **TC-SEC-004**: Rate limiting on API endpoints
210. **TC-SEC-005**: JWT token expiration enforced
211. **TC-SEC-006**: Password hashing with bcrypt
212. **TC-SEC-007**: HTTPS enforcement
213. **TC-SEC-008**: Secure cookie flags set
214. **TC-SEC-009**: Input sanitization
215. **TC-SEC-010**: Authorization checks on routes
216. **TC-SEC-011**: No sensitive data in logs
217. **TC-SEC-012**: Content Security Policy headers
218. **TC-SEC-013**: No exposed API keys
219. **TC-SEC-014**: Session timeout after inactivity
220. **TC-SEC-015**: User can only access own data

### Notification Tests (10 cases)
221. **TC-NOTIF-001**: Task deadline notification
222. **TC-NOTIF-002**: Habit reminder notification
223. **TC-NOTIF-003**: AI suggestion notification
224. **TC-NOTIF-004**: Achievement notification
225. **TC-NOTIF-005**: Notification preferences saved
226. **TC-NOTIF-006**: Push notifications on mobile
227. **TC-NOTIF-007**: Email notifications sent
228. **TC-NOTIF-008**: Notification sound toggleable
229. **TC-NOTIF-009**: Mark notification as read
230. **TC-NOTIF-010**: Clear all notifications

### Error Handling Tests (10 cases)
231. **TC-ERR-001**: Network error shows message
232. **TC-ERR-002**: 404 page displayed
233. **TC-ERR-003**: 500 error handled gracefully
234. **TC-ERR-004**: Form validation errors shown
235. **TC-ERR-005**: API timeout handled
236. **TC-ERR-006**: Retry mechanism on failure
237. **TC-ERR-007**: Error boundary catches React errors
238. **TC-ERR-008**: Offline mode indication
239. **TC-ERR-009**: Invalid data handled
240. **TC-ERR-010**: User-friendly error messages

---

## Test Execution Summary

**Total Test Cases: 240**

### Coverage by Category:
- Authentication: 30 tests (12.5%)
- Task Management: 50 tests (20.8%)
- Habit Tracking: 30 tests (12.5%)
- Calendar & Scheduling: 25 tests (10.4%)
- AI & Automation: 20 tests (8.3%)
- Analytics: 15 tests (6.3%)
- UI/UX: 30 tests (12.5%)
- Security: 15 tests (6.3%)
- Notifications: 10 tests (4.2%)
- Error Handling: 10 tests (4.2%)

### Priority Classification:
- **P0 Critical**: 80 tests (Must pass for release)
- **P1 High**: 100 tests (Should pass for release)
- **P2 Medium**: 40 tests (Nice to have)
- **P3 Low**: 20 tests (Future enhancement)

### Test Types:
- Unit Tests: 120 tests
- Integration Tests: 80 tests
- E2E Tests: 40 tests

### Automation Status:
- Automated: 180 tests (75%)
- Manual: 60 tests (25%)

---

## Test Execution Guidelines

### Prerequisites
1. Node.js 18+ installed
2. MongoDB running locally or connection string
3. Redis running for caching
4. Environment variables configured

### Running Tests

```bash
# Run all client tests
cd apps/client
npm run test

# Run all server tests
cd apps/server
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test tasks.test.ts
```
