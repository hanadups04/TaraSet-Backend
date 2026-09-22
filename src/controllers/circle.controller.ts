import { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getCirclesServiceAll, getCircleServiceSingle, createCircleService, joinCircleService } from '../services/circle.service';
import { z } from "zod";

const idParamsSchema = z.object({
  circle_id: z.uuid(),
})

const stringParamsSchema = z.object({
  circle_name: z.string(),
  circle_code: z.string()
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

  console.log(parsed.error?.issues);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid circle name"
    });
  }

  const { circle_name } = parsed.data;

  try {
    const createCircle = await createCircleService(circle_name, user_id);

    console.log("circle_name", circle_name)

    if (!circle_name) {
      return res.status(404).json({
        error: "Circle name is required"
      })
    }
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

  const parsed = stringParamsSchema.safeParse(req.body);

  console.log(parsed.error?.issues);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid code"
    });
  }

  const { circle_code } = parsed.data;
  
  try {
    console.log("circle_code", circle_code);
    // const joinCircle = await joinCircleService(circle_code, user_id);
    // res.status(200).json(joinCircle);
  } catch (error) {
    res.status(500).json({
      code: error,
      error: "Failed to join a circle"
    });
  }
}