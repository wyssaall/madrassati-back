import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
  registerController,
  loginController,
  refreshController,
  meController,
  logoutController
} from '../controllers/authController';

const router = Router();

// Routes publiques
router.post('/register', registerController);
router.post('/login', loginController);
router.post('/refresh', refreshController);

// Routes protégées
router.get('/me', requireAuth, meController);
router.post('/logout', requireAuth, logoutController);

export default router;