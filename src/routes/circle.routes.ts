import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { 
    getCircleControllerAll, 
    getCircleControllerSingle, 
    postCircleController, 
    postJoinCircleController,
    getItineraryController,
    postDateController,
    postItineraryController,
    deleteCircleController,
    deleteItineraryContoller,
    deleteDateController } 
    from '../controllers/circle.controller';
import { verifyCsrfToken } from "../middleware/csrf";

const router = Router();

router.get("/getAllCircles", requireAuth, getCircleControllerAll);
router.get("/:circle_id", requireAuth, getCircleControllerSingle);
router.post("/createCircle", requireAuth, verifyCsrfToken, postCircleController);
router.post("/joinCircle", requireAuth, verifyCsrfToken, postJoinCircleController);
router.get("/itinerary/:circle_id", requireAuth, getItineraryController);
router.post("/date", requireAuth, postDateController);
router.post("/addItinerary", requireAuth, postItineraryController);
router.delete("/deleteCircle", requireAuth, deleteCircleController);
router.delete("/deleteItinerary", requireAuth, deleteItineraryContoller);
router.delete("/deleteDate", requireAuth, deleteDateController);

export default router;