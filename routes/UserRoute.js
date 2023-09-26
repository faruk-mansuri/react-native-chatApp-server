import { Router } from 'express';
const router = Router();
import {
  getApplicationStats,
  getCurrentUser,
  updateUser,
} from '../controllers/userController.js';
import { updateUserInput } from '../middleware/validationMiddleware.js';
import {
  authorizedPermission,
  checkForTestUser,
} from '../middleware/authMiddleware.js';
import upload from '../middleware/multerMiddleware.js';

router.route('/current-user').get(getCurrentUser);

router
  .route('/admin/app-stats')
  .get(authorizedPermission('admin'), getApplicationStats);

router
  .route('/update-user')
  .patch(
    checkForTestUser,
    upload.single('avatar'),
    updateUserInput,
    updateUser
  );

export default router;
