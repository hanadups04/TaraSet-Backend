import { Router } from 'express';
import { getCircle, createItem } from '../controllers/items.controller';

const router = Router();

router.get('/', getCircle);
router.post('/', createItem);

export default router;