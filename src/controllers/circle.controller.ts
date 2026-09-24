import { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getCirclesServiceAll, 
          getCircleServiceSingle, 
          createCircleService, 
          joinCircleService,
          getItineraryService,
          addDateService,
          addItineraryService } from '../services/circle.service';
import { z } from "zod";
import { error } from 'console';

//PURPOSE: ZOD validation for get All circles
const idParamsSchema = z.object({
  circle_id: z.uuid(),
})


//PURPOSE: ZOD validation for creating circle
const stringParamsSchema = z.object({
  circle_name: z.string(),
})

//PURPOSE: ZOD validation for joining circle
const joinParamsSchema = z.object({
  circle_code: z.string(),
})

//PURPOSE: ZOD validation for get itinerary tbl
const getItineraryParamsSchema = z.object({
  circle_id: z.uuid(),
})

//PURPOSE: ZOD validation for  circle_id in add available date
const addAvailableDateParamsSchema = z.object({
  circle_id: z.uuid(),
  date_available: z.string(),
})

//PURPOSE: ZOD validation for  add itinerary
const addItineraryParamsSchema = z.object({
  circle_id: z.uuid(),
  name: z.string(), 
  location: z.string(),
  start_date: z.string(), 
  end_date: z.string(),
  notes: z.string(),
})

export const getCircleControllerAll = async (req: Request, res: Response) => {
    const user_id = (req as any).user_id;
  try {
    const circle = await getCirclesServiceAll(user_id);
    res.status(200).json(circle);
  } catch (error) {
    res.status(500).json({
        code: error, 
        error: 'Failed to fetch circles'
    })
  }
};

export const getCircleControllerSingle = async (req: Request, res: Response) => {
  const user_id = (req as any).user_id;

  const parsed = idParamsSchema.safeParse(req.params);
  //req.params holds the url: http://localhost:3000/api/papers/57cfd510-9e0e-4cf1-b10a-ae79623a840b

  if (!parsed.success) {
    //if zod fails, return 400 e.g. type mismatch, expecting uuid, passed plain string will return 400
    return res.status(400).json({
      error: "invalid circle_id"
    });
  }

  const { circle_id } = parsed.data;

  try {
    const circle = await getCircleServiceSingle(user_id, circle_id);

    if (!circle) {
      //PURPOSE: if user tries to read data that isn't theirs, it will return a 404 data not found
      return res.status(404).json({
        error: "Circle not found"
      })
    }
    res.status(200).json(circle);
  } catch (error) {
    res.status(500).json({
        code: error, 
        error: 'Failed to fetch circles'
    })
  }
};

export const createCircleController = async (req: Request, res: Response) => {
  const user_id = (req as any).user_id;

  const parsed = stringParamsSchema.safeParse(req.body);

  
  if (!parsed.success) {
    console.log(parsed.error?.issues);
    return res.status(400).json({
      error: "Invalid circle name"
    });
  }

  const { circle_name } = parsed.data;

  try {
    const createCircle = await createCircleService(circle_name, user_id);

    console.log("circle_name", circle_name);
    res.status(200).json(createCircle);
  } catch (error) {
    res.status(500).json({
      code: error,
      error: "Failed to create circle"
    });
  }
}

export const joinCircleController = async (req: Request, res: Response) => {
  const user_id = (req as any).user_id;

  const parsed = joinParamsSchema.safeParse(req.body);

  if (!parsed.success) {
    console.log(parsed.error?.issues);
    return res.status(400).json({
      error: "Invalid code"
    });
  }

  const { circle_code } = parsed.data;
  
  try {
    console.log("circle_code", circle_code);
    const joinCircle = await joinCircleService(circle_code, user_id);
    res.status(200).json(joinCircle);
  } catch (error) {
    res.status(500).json({
      code: error,
      error: "Failed to join a circle"
    });
  }
}

export const getItineraryController = async (req: Request, res: Response) => {

  const parsed = getItineraryParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    console.log(parsed.error?.issues);
    return res.status(400).json({
      error: "Invalid id"
    });
  }

  const { circle_id } = parsed.data;

  try {

    console.log("circle_code", circle_id);

    const getItinerary = await getItineraryService(circle_id);
    res.status(200).json(getItinerary);
  } catch (error) {
    res.status(500).json({
      code: error,
      error: "Failed to fetch itinerary"
    });
  } 
}

export const addDateController = async(req: Request, res: Response) => {
  const user_id = (req as any).user_id;

  const parsed = addAvailableDateParamsSchema.safeParse(req.body);

  if(!parsed.success){
    console.log(parsed.error.issues);
    return res.status(400).json({
      error: "wrongggg"
    });
  }

  const { circle_id, date_available} = parsed.data;

  try {
    console.log("date", circle_id, user_id, date_available);
    const addDate = await addDateService(circle_id, user_id, date_available);
    res.status(200).json(addDate);
  } catch (error) {
    res.status(500).json({
      code: error,
      error: "Failed to add available date"
    });
  }
}

export const addItineraryController = async (req: Request, res: Response) => {
  const parsed = addItineraryParamsSchema.safeParse(req.body);

  if(!parsed.success){
    console.log(parsed.error.issues);
    return res.status(404).json({
      error: "Fields are incorrect"
    });
  }

  const {
    circle_id, 
    name, 
    location, 
    start_date, 
    end_date, 
    notes } = parsed.data;

  try {
    console.log("add itinerary data", circle_id, name, location, start_date, end_date, notes);
    const addItinerary = await addItineraryService(circle_id, name, location, start_date, end_date, notes);
    res.status(200).json(addItinerary);
  } catch (error) {
    res.status(500).json({
      code: error,
      error: "Failed to add itinerary"
    });
  }
}


