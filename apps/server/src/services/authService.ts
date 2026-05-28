import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { Calendar } from '../models/Calendar';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middlewares/errorHandler';
import { emailService } from './emailService';
import { config } from '../config';

export const authService = {
  async register(name: string, email: string, password: string, timezone = 'UTC') {
    const existing = await User.findOne({ email });
    if (existing) throw new AppError('Email already registered', 409);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name,
      email,
      password,
      timezone,
      emailVerificationToken: verificationToken,
    });

    // Create default calendar
    await Calendar.create({
      name: 'My Calendar',
      color: '#6366f1',
      provider: 'flowtime',
      isDefault: true,
      isPrimary: true,
      userId: user._id,
    });

    // Send verification email (non-blocking)
    emailService.sendVerificationEmail(email, name, verificationToken).catch(() => {});

    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: tokens.refreshToken },
    });

    return { user, tokens };
  },

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user || !user.password) throw new AppError('Invalid credentials', 401);

    const isValid = await user.comparePassword(password);
    if (!isValid) throw new AppError('Invalid credentials', 401);

    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Rotate refresh tokens (keep last 5)
    const refreshTokens = [...(user.refreshTokens || []), tokens.refreshToken].slice(-5);
    await User.findByIdAndUpdate(user._id, {
      refreshTokens,
      lastActive: new Date(),
    });

    return { user, tokens };
  },

  async refreshTokens(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId).select('+refreshTokens');
    if (!user) throw new AppError('User not found', 401);

    if (!user.refreshTokens?.includes(refreshToken)) {
      // Token reuse detected - invalidate all tokens
      await User.findByIdAndUpdate(user._id, { refreshTokens: [] });
      throw new AppError('Token reuse detected', 401);
    }

    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Replace old refresh token
    const newTokens = user.refreshTokens
      .filter((t) => t !== refreshToken)
      .concat(tokens.refreshToken)
      .slice(-5);

    await User.findByIdAndUpdate(user._id, { refreshTokens: newTokens });

    return tokens;
  },

  async logout(userId: string, refreshToken: string) {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  },

  async verifyEmail(token: string) {
    const user = await User.findOne({ emailVerificationToken: token }).select('+emailVerificationToken');
    if (!user) throw new AppError('Invalid verification token', 400);

    await User.findByIdAndUpdate(user._id, {
      emailVerified: true,
      emailVerificationToken: undefined,
    });

    return user;
  },

  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) return; // Don't reveal if email exists

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    await emailService.sendPasswordResetEmail(email, user.name, resetToken);
  },

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) throw new AppError('Invalid or expired reset token', 400);

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    return user;
  },

  async googleOAuth(profile: { id: string; emails?: Array<{ value: string }>; displayName: string; photos?: Array<{ value: string }> }) {
    const email = profile.emails?.[0]?.value;
    if (!email) throw new AppError('No email from Google', 400);

    let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email,
        googleId: profile.id,
        avatar: profile.photos?.[0]?.value,
        emailVerified: true,
      });

      await Calendar.create({
        name: 'My Calendar',
        color: '#6366f1',
        provider: 'flowtime',
        isDefault: true,
        isPrimary: true,
        userId: user._id,
      });
    } else if (!user.googleId) {
      await User.findByIdAndUpdate(user._id, { googleId: profile.id });
    }

    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: tokens.refreshToken },
      lastActive: new Date(),
    });

    return { user, tokens };
  },
};
