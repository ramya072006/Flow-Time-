import { Router, RequestHandler } from 'express';
import { aiController } from '../controllers/aiController';
import { authenticate } from '../middlewares/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'AI rate limit exceeded' },
});

router.use(authenticate as RequestHandler);
router.use(aiLimiter);

router.post('/schedule', aiController.generateSchedule as RequestHandler);
router.post('/chat', aiController.chat as RequestHandler);
router.get('/chat/history', aiController.getChatHistory as RequestHandler);
router.delete('/chat/history', aiController.clearChatHistory as RequestHandler);
router.get('/insights', aiController.getInsights as RequestHandler);
router.get('/recommendations', aiController.getRecommendations as RequestHandler);
router.post('/recommendations/:id/apply', aiController.applyRecommendation as RequestHandler);
router.post('/recommendations/:id/dismiss', aiController.dismissRecommendation as RequestHandler);
router.post('/estimate-duration', aiController.estimateDuration as RequestHandler);

export default router;
