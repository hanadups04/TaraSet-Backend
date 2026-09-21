import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getAllCircleController, getACircleController } from '../controllers/circle.controller';

const router = Router();

router.get('/getAllCircles', requireAuth, getAllCircleController);
router.get('/getCircle', requireAuth, getACircleController);

export default router;