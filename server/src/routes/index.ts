import { Router } from 'express';

import userRoutes from './user.routes';
import plantRoutes from './plant.routes';

const router = Router();

router.use('/api', userRoutes);
router.use('/api', plantRoutes);

export default router;
