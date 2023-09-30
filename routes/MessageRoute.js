import { Router } from 'express';
const router = Router();
import {
  sendMessage,
  conversation,
  deleteMessages,
} from '../controllers/messageController.js';
import upload from '../middleware/multerMiddleware.js';

router.route('/deleteMessages').delete(deleteMessages);
router
  .route('/:receiverId')
  .get(conversation)
  .post(upload.single('message'), sendMessage);

export default router;
