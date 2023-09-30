import { Router } from 'express';
const router = Router();
import {
  getCurrentUser,
  updateUser,
  getAllUsers,
  friendRequest,
  showAllFriendsRequest,
  acceptFriendRequest,
  getAcceptedFriends,
  getSentFriendRequest,
  getAllFriends,
} from '../controllers/userController.js';
import { updateUserInput } from '../middleware/validationMiddleware.js';
import { authorizedPermission } from '../middleware/authMiddleware.js';
import upload from '../middleware/multerMiddleware.js';

router.route('/current-user').get(getCurrentUser);

router
  .route('/update-user')
  .patch(upload.single('avatar'), updateUserInput, updateUser);

router.route('/get-all-users').get(getAllUsers);

router.route('/friend-request').get(showAllFriendsRequest);

router.route('/friend-request/accept/:id').post(acceptFriendRequest);

router.route('/friend-request/:id').post(friendRequest);

router.route('/accepted-friends').get(getAcceptedFriends);

router.route('/sent/friend-request').get(getSentFriendRequest);

router.route('/friends-list').get(getAllFriends);

export default router;
