import { Router, RequestHandler } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate as RequestHandler);

router.get('/dashboard', analyticsController.getDashboard);
router.get('/productivity-trend', analyticsController.getProductivityTrend);
router.get('/time-allocation', analyticsController.getTimeAllocation);
router.get('/weekly-report', analyticsController.getWeeklyReport);

export default router;
