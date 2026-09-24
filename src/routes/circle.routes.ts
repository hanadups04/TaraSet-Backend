import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { 
    getCircleControllerAll, 
    getCircleControllerSingle, 
    createCircleController, 
    joinCircleController,
    getItineraryController,
    addDateController,
    addItineraryController,
    deleteCircleController,
    deleteItineraryContoller,
    deleteDateController } 
    from '../controllers/circle.controller';
import { verifyCsrfToken } from "../middleware/csrf";

const router = Router();

router.get("/getAllCircles", requireAuth, getCircleControllerAll);
router.get("/:circle_id", requireAuth, getCircleControllerSingle);
router.post("/createCircle", requireAuth, verifyCsrfToken, createCircleController);
router.post("/joinCircle", requireAuth, verifyCsrfToken, joinCircleController);
router.get("/itinerary/:circle_id", requireAuth, getItineraryController);
router.post("/date", requireAuth, addDateController);
router.post("/addItinerary", requireAuth, addItineraryController);
router.delete("/deleteCircle", requireAuth, deleteCircleController);
router.delete("/deleteItinerary", requireAuth, deleteItineraryContoller);
router.delete("/deleteDate", requireAuth, deleteDateController);

export default router;