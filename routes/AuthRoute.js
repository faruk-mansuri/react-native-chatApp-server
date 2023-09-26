import { Router } from 'express';
const router = Router();
import { register, login } from '../controllers/authController.js';
import {
  validateLoginInput,
  validateRegisterInput,
} from '../middleware/validationMiddleware.js';

import rateLimiter from 'express-rate-limit';

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: { msg: 'IP rate limit exceeded, retry in 15 minutes.' },
});

router.route('/register').post(apiLimiter, validateRegisterInput, register);
router.route('/login').post(apiLimiter, validateLoginInput, login);

export default router;
