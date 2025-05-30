import express from 'express';
import { fetchWorkoutEvents, removePastEvents } from '../controllers/eventControllers';

const router = express.Router();

router.get('/events/:userId', fetchWorkoutEvents);
router.delete('/:userId/past-events', removePastEvents);

export default router;