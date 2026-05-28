import { Router, RequestHandler } from 'express';
import { habitController } from '../controllers/habitController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate as RequestHandler);

router.get('/', habitController.getHabits);
router.get('/today', habitController.getTodayHabits);
router.get('/:id', habitController.getHabit);
router.post('/', habitController.createHabit);
router.patch('/:id', habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);
router.post('/:id/log', habitController.logCompletion);
router.get('/:id/metrics', habitController.getMetrics);

export default router;
