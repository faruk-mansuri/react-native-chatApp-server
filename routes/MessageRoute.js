import { Router } from 'express';
const router = Router();
import {
  sendMessage,
  conversation,
  deleteMessages,
} from '../controllers/messageController.js';
import upload from '../middleware/multerMiddleware.js';

router
  .route('/:receiverId')
  .get(conversation)
  .post(upload.single('message'), sendMessage);

router.route('/deleteMessages/:messagesIds').delete(deleteMessages);

export default router;
