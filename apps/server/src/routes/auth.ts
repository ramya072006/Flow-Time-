import { Router, RequestHandler } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many requests, please try again later' },
});

router.post('/register', authLimiter, authController.register as RequestHandler);
router.post('/login', authLimiter, authController.login as RequestHandler);
router.post('/logout', authenticate as RequestHandler, authController.logout as RequestHandler);
router.post('/refresh', authController.refreshToken as RequestHandler);
router.get('/verify-email', authController.verifyEmail as RequestHandler);
router.post('/forgot-password', authLimiter, authController.forgotPassword as RequestHandler);
router.post('/reset-password', authLimiter, authController.resetPassword as RequestHandler);
router.get('/me', authenticate as RequestHandler, authController.getMe as RequestHandler);
router.patch('/profile', authenticate as RequestHandler, authController.updateProfile as RequestHandler);
router.patch('/change-password', authenticate as RequestHandler, authController.changePassword as RequestHandler);

export default router;
