import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { 
    getCircleControllerAll, 
    getCircleControllerSingle, 
    createCircleController, 
    joinCircleController } 
    from '../controllers/circle.controller';
import { verifyCsrfToken } from "../middleware/csrf";

const router = Router();

router.get("/getAllCircles", requireAuth, getCircleControllerAll);
router.get("/:circle_id", requireAuth, getCircleControllerSingle);
router.post("/createCircle", requireAuth, verifyCsrfToken, createCircleController);
router.post("/joinCircle", requireAuth, verifyCsrfToken, joinCircleController);

export default router;