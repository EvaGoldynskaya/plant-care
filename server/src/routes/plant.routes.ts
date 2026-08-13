import { Router } from 'express';

import {
  addPlant,
  deletePlant,
  getPlants,
  updatePlant,
} from '../controllers/plant.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/plants', getPlants);
router.post('/addPlant', addPlant);
router.put('/updatePlant/:id', updatePlant);
router.delete('/deletePlant/:id', deletePlant);

export default router;
