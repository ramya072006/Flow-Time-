import { Router, RequestHandler } from 'express';
import { calendarController } from '../controllers/calendarController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate as RequestHandler);

router.get('/calendars', calendarController.getCalendars);
router.post('/calendars', calendarController.createCalendar);
router.get('/events', calendarController.getEvents);
router.get('/events/free-slots', calendarController.getFreeSlots);
router.get('/events/meeting-load', calendarController.getMeetingLoad);
router.post('/events/conflicts', calendarController.detectConflicts);
router.get('/events/:id', calendarController.getEvent);
router.post('/events', calendarController.createEvent);
router.patch('/events/:id', calendarController.updateEvent);
router.delete('/events/:id', calendarController.deleteEvent);

export default router;
