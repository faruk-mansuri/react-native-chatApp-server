import { Router } from 'express';
const router = Router();
import {
  getAllMessage,
  sendMessage,
  receiveMessage,
} from '../controllers/messageController.js';

router.route('/').get(getAllMessage);

export default router;
