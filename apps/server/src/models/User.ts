import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  timezone: string;
  workHours: {
    start: string;
    end: string;
    days: number[];
  };
  sleepHours: {
    bedtime: string;
    wakeTime: string;
  };
  productivityPreferences: {
    peakHours: string[];
    preferredFocusDuration: number;
    breakDuration: number;
    deepWorkBlocks: number;
  };
  focusPreferences: {
    protectMornings: boolean;
    protectAfternoons: boolean;
    minFocusBlock: number;
    maxMeetingsPerDay: number;
  };
  aiSettings: {
    autoSchedule: boolean;
    autoReschedule: boolean;
    learningEnabled: boolean;
    suggestionFrequency: string;
  };
  notificationSettings: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    reminderMinutes: number[];
    deadlineAlerts: boolean;
    aiSuggestions: boolean;
  };
  connectedCalendars: Array<{
    provider: string;
    accountEmail: string;
    calendarId: string;
    syncEnabled: boolean;
    accessToken?: string;
    refreshToken?: string;
    lastSynced?: Date;
  }>;
  onboardingCompleted: boolean;
  role: 'user' | 'admin';
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshTokens: string[];
  googleId?: string;
  microsoftId?: string;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    avatar: { type: String },
    timezone: { type: String, default: 'UTC' },
    workHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      days: { type: [Number], default: [1, 2, 3, 4, 5] },
    },
    sleepHours: {
      bedtime: { type: String, default: '23:00' },
      wakeTime: { type: String, default: '07:00' },
    },
    productivityPreferences: {
      peakHours: { type: [String], default: ['09:00', '10:00', '11:00'] },
      preferredFocusDuration: { type: Number, default: 90 },
      breakDuration: { type: Number, default: 15 },
      deepWorkBlocks: { type: Number, default: 2 },
    },
    focusPreferences: {
      protectMornings: { type: Boolean, default: true },
      protectAfternoons: { type: Boolean, default: false },
      minFocusBlock: { type: Number, default: 30 },
      maxMeetingsPerDay: { type: Number, default: 4 },
    },
    aiSettings: {
      autoSchedule: { type: Boolean, default: true },
      autoReschedule: { type: Boolean, default: true },
      learningEnabled: { type: Boolean, default: true },
      suggestionFrequency: { type: String, default: 'medium' },
    },
    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      reminderMinutes: { type: [Number], default: [15, 60] },
      deadlineAlerts: { type: Boolean, default: true },
      aiSuggestions: { type: Boolean, default: true },
    },
    connectedCalendars: [
      {
        provider: String,
        accountEmail: String,
        calendarId: String,
        syncEnabled: { type: Boolean, default: true },
        accessToken: { type: String, select: false },
        refreshToken: { type: String, select: false },
        lastSynced: Date,
      },
    ],
    onboardingCompleted: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshTokens: { type: [String], select: false, default: [] },
    googleId: { type: String, sparse: true },
    microsoftId: { type: String, sparse: true },
    lastActive: { type: Date },
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ microsoftId: 1 }, { sparse: true });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

export const User = mongoose.model<IUser>('User', UserSchema);
