import { Request, Response } from 'express';
import { Item } from '../types';
import { getACircleServices } from '../services/circle.service';

let items: Item[] = [{ id: 1, name: 'Example' }];

export const getCircle = async (req: Request, res: Response) => {
  try {
    const circles = await getACircleServices("029d2161-4bc9-4f99-a8e0-e6067f4d20e7");
    res.status(200).json(circles);
  } catch (error) {
    res.status(500).json({code: error, error: 'Failed to fetch circles'})
  }
};

export const createItem = (req: Request, res: Response) => {
  const { name } = req.body as { name?: string };
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const newItem: Item = { id: Date.now(), name };
  items.push(newItem);
  res.status(201).json(newItem);
};