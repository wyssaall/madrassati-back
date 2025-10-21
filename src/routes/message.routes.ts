import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import {
  getConversations,
  getConversationHistory,
  sendMessage,
  getContacts,
  startConversation
} from '../controllers/message.controller.js';

const router = express.Router();

// All message routes require authentication
// TODO: Re-enable authentication for production
// router.use(verifyToken);

// Message routes
router.get('/:userId', getConversations);
router.get('/conversation/:userId/:receiverId/:childId', getConversationHistory);
router.get('/contacts/:userId', getContacts);
router.post('/', sendMessage);
router.post('/start-conversation', startConversation);

export default router;
