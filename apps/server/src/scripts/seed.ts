import mongoose from 'mongoose';
import { config } from '../config';
import { User } from '../models/User';
import { Task } from '../models/Task';
import { Habit } from '../models/Habit';
import { Calendar } from '../models/Calendar';
import { CalendarEvent } from '../models/CalendarEvent';
import { Notification } from '../models/Notification';

const seed = async () => {
  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 30000,
    family: 4,
  });
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Task.deleteMany({}),
    Habit.deleteMany({}),
    Calendar.deleteMany({}),
    CalendarEvent.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Create demo user
  const user = await User.create({
    name: 'Alex Johnson',
    email: 'demo@flowtime.ai',
    password: 'Demo1234!',
    timezone: 'America/New_York',
    emailVerified: true,
    onboardingCompleted: true,
    workHours: { start: '09:00', end: '18:00', days: [1, 2, 3, 4, 5] },
    productivityPreferences: {
      peakHours: ['09:00', '10:00', '11:00'],
      preferredFocusDuration: 90,
      breakDuration: 15,
      deepWorkBlocks: 2,
    },
    focusPreferences: {
      protectMornings: true,
      protectAfternoons: false,
      minFocusBlock: 30,
      maxMeetingsPerDay: 3,
    },
  });
  console.log(`Created demo user: ${user.email}`);

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@flowtime.ai',
    password: 'Admin1234!',
    role: 'admin',
    emailVerified: true,
    onboardingCompleted: true,
  });
  console.log(`Created admin user: ${admin.email}`);

  // Create calendar
  const calendar = await Calendar.create({
    name: 'My Calendar',
    color: '#6366f1',
    provider: 'flowtime',
    isDefault: true,
    isPrimary: true,
    userId: user._id,
  });

  // Create tasks
  const now = new Date();
  const tasks = await Task.insertMany([
    {
      title: 'Design new dashboard layout',
      description: 'Create wireframes and mockups for the updated dashboard',
      status: 'in_progress',
      priority: 'high',
      estimatedDuration: 120,
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      tags: ['design', 'ui'],
      category: 'Work',
      energyRequired: 'high',
      flexibilityScore: 30,
      userId: user._id,
    },
    {
      title: 'Review Q4 analytics report',
      description: 'Go through the quarterly analytics and prepare summary',
      status: 'pending',
      priority: 'urgent',
      estimatedDuration: 60,
      dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      tags: ['analytics', 'reporting'],
      category: 'Work',
      energyRequired: 'medium',
      flexibilityScore: 20,
      userId: user._id,
    },
    {
      title: 'Write blog post on productivity',
      description: 'Draft a 1500-word article on deep work techniques',
      status: 'pending',
      priority: 'medium',
      estimatedDuration: 90,
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      tags: ['writing', 'content'],
      category: 'Personal',
      energyRequired: 'high',
      flexibilityScore: 70,
      userId: user._id,
    },
    {
      title: 'Team standup preparation',
      description: 'Prepare talking points for tomorrow\'s standup',
      status: 'pending',
      priority: 'low',
      estimatedDuration: 15,
      dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      tags: ['meetings'],
      category: 'Work',
      energyRequired: 'low',
      flexibilityScore: 80,
      userId: user._id,
    },
    {
      title: 'Read "Deep Work" chapter 3',
      description: 'Continue reading and take notes',
      status: 'completed',
      priority: 'low',
      estimatedDuration: 45,
      completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      tags: ['reading', 'learning'],
      category: 'Personal',
      energyRequired: 'medium',
      flexibilityScore: 90,
      userId: user._id,
    },
  ]);
  console.log(`Created ${tasks.length} tasks`);

  // Create habits
  const habits = await Habit.insertMany([
    {
      title: 'Morning Meditation',
      description: '10 minutes of mindfulness meditation',
      category: 'mindfulness',
      frequency: 'daily',
      estimatedDuration: 10,
      preferredTime: 'morning',
      preferredTimeSlot: '07:00',
      streak: 12,
      longestStreak: 21,
      completionRate: 85,
      color: '#8b5cf6',
      icon: '🧘',
      userId: user._id,
    },
    {
      title: 'Exercise',
      description: '30 minutes of physical activity',
      category: 'fitness',
      frequency: 'daily',
      estimatedDuration: 30,
      preferredTime: 'morning',
      preferredTimeSlot: '07:30',
      streak: 5,
      longestStreak: 30,
      completionRate: 70,
      color: '#10b981',
      icon: '💪',
      userId: user._id,
    },
    {
      title: 'Read for 30 minutes',
      description: 'Read books or articles',
      category: 'learning',
      frequency: 'daily',
      estimatedDuration: 30,
      preferredTime: 'evening',
      preferredTimeSlot: '21:00',
      streak: 8,
      longestStreak: 15,
      completionRate: 75,
      color: '#f59e0b',
      icon: '📚',
      userId: user._id,
    },
    {
      title: 'Weekly Review',
      description: 'Review goals and plan next week',
      category: 'work',
      frequency: 'weekly',
      targetDays: [0], // Sunday
      estimatedDuration: 60,
      preferredTime: 'morning',
      streak: 3,
      longestStreak: 8,
      completionRate: 60,
      color: '#6366f1',
      icon: '📋',
      userId: user._id,
    },
  ]);
  console.log(`Created ${habits.length} habits`);

  // Create calendar events
  const eventStart = new Date(now);
  eventStart.setHours(10, 0, 0, 0);
  const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);

  await CalendarEvent.insertMany([
    {
      title: 'Team Standup',
      start: eventStart,
      end: eventEnd,
      type: 'meeting',
      source: 'flowtime',
      color: '#f59e0b',
      calendarId: calendar._id,
      userId: user._id,
      attendees: [
        { email: 'alice@company.com', name: 'Alice', status: 'accepted' },
        { email: 'bob@company.com', name: 'Bob', status: 'accepted' },
      ],
    },
    {
      title: 'Deep Work: Dashboard Design',
      start: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      end: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      type: 'focus',
      source: 'flowtime',
      color: '#10b981',
      isFocusTime: true,
      calendarId: calendar._id,
      userId: user._id,
    },
    {
      title: 'Lunch Break',
      start: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      end: new Date(now.getTime() + 5 * 60 * 60 * 1000),
      type: 'break',
      source: 'flowtime',
      color: '#06b6d4',
      calendarId: calendar._id,
      userId: user._id,
    },
  ]);
  console.log('Created calendar events');

  // Create notifications
  await Notification.insertMany([
    {
      type: 'ai_suggestion',
      title: 'AI Scheduling Suggestion',
      message: 'I found 3 optimal time slots for your pending tasks this week.',
      userId: user._id,
    },
    {
      type: 'deadline_alert',
      title: 'Task Due Tomorrow',
      message: '"Review Q4 analytics report" is due tomorrow.',
      userId: user._id,
      actionUrl: '/tasks',
    },
    {
      type: 'habit_reminder',
      title: 'Habit Reminder',
      message: 'Don\'t forget your morning meditation today!',
      userId: user._id,
    },
  ]);
  console.log('Created notifications');

  console.log('\n✅ Seed completed successfully!');
  console.log('\nDemo credentials:');
  console.log('  Email: demo@flowtime.ai');
  console.log('  Password: Demo1234!');
  console.log('\nAdmin credentials:');
  console.log('  Email: admin@flowtime.ai');
  console.log('  Password: Admin1234!');

  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
