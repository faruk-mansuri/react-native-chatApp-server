import { Router } from 'express';
const router = Router();
import {
  getAllMessage,
  sendMessage,
  receiveMessage,
} from '../controllers/messageController.js';
import upload from '../middleware/multerMiddleware.js';

router.route('/:receiverId').post(upload.single('avatar'), sendMessage);

export default router;
