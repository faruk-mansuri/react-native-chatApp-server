import { Router } from 'express';
const router = Router();
import {
  getAllMessage,
  sendMessage,
  receiveMessage,
  conversation,
} from '../controllers/messageController.js';
import upload from '../middleware/multerMiddleware.js';

router
  .route('/:receiverId')
  .get(conversation)
  .post(upload.single('avatar'), sendMessage);

export default router;
