import { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { getAllCirclesServices, getACircleServices } from '../services/circle.service';

export const getAllCircleController = async (req: Request, res: Response) => {
    const user_id = (req as any).user_id;
  try {
    const circle = await getAllCirclesServices(user_id);
    res.status(200).json(circle);
  } catch (error) {
    res.status(500).json({
        code: error, 
        error: 'Failed to fetch circles'
    })
  }
};

export const getACircleController = async (req: Request, res: Response) => {
  try {
    const circle = await getACircleServices("029d2161-4bc9-4f99-a8e0-e6067f4d20e7");
    res.status(200).json(circle);
  } catch (error) {
    res.status(500).json({
        code: error, 
        error: 'Failed to fetch circles'
    })
  }
};