import { Router, RequestHandler } from 'express';
import { taskController } from '../controllers/taskController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate as RequestHandler);

router.get('/', taskController.getTasks);
router.get('/upcoming', taskController.getUpcoming);
router.get('/overdue', taskController.getOverdue);
router.get('/:id', taskController.getTask);
router.post('/', taskController.createTask);
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/:id/complete', taskController.completeTask);
router.post('/:id/comments', taskController.addComment);
router.post('/:id/subtasks', taskController.addSubtask);
router.patch('/:id/subtasks/:subtaskId/toggle', taskController.toggleSubtask);

export default router;
