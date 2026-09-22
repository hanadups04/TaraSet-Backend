import { Request, Response } from 'express';
import { Item } from '../types';
import { getAllCircles } from '../services/items.service';

let items: Item[] = [{ id: 1, name: 'Example' }];

export const getCircle = async (req: Request, res: Response) => {
  try {
    const circles = await getAllCircles();
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