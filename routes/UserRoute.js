import { Router } from 'express';
const router = Router();
import {
  getApplicationStats,
  getCurrentUser,
  updateUser,
  getAllUsers,
  friendRequest,
} from '../controllers/userController.js';
import { updateUserInput } from '../middleware/validationMiddleware.js';
import { authorizedPermission } from '../middleware/authMiddleware.js';
import upload from '../middleware/multerMiddleware.js';

router.route('/current-user').get(getCurrentUser);

router
  .route('/admin/app-stats')
  .get(authorizedPermission('admin'), getApplicationStats);

router
  .route('/update-user')
  .patch(upload.single('avatar'), updateUserInput, updateUser);

router.route('/get-all-users').get(getAllUsers);

router.route('/friend-request/:id').post(friendRequest);

export default router;
