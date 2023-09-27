import User from '../models/UserModel.js';
import Job from '../models/JobModel.js';
import { StatusCodes } from 'http-status-codes';
import cloudinary from 'cloudinary';
import { formatImage } from '../middleware/multerMiddleware.js';

export const getCurrentUser = async (req, res) => {
  // const user = await User.findOne({ _id: req.user.userId }).select('-password');
  const user = await User.findOne({ _id: req.user.userId });
  const userWithoutPassword = user.toJSON();
  res.status(StatusCodes.OK).json({ user: userWithoutPassword });
};

export const getApplicationStats = async (req, res) => {
  const users = await User.countDocuments();
  const jobs = await Job.countDocuments();
  res.status(StatusCodes.OK).json({ users, jobs });
};

export const updateUser = async (req, res) => {
  const newUser = { ...req.body };
  delete newUser.password;
  // don't want to update password just in case if anyhow user also pass password

  if (req.file) {
    const file = formatImage(req.file);
    const response = await cloudinary.v2.uploader.upload(file);

    newUser.avatar = response.secure_url;
    newUser.avatarPublicId = response.public_id;
  }
  const updateUser = await User.findByIdAndUpdate(req.user.userId, newUser);
  // we are returning old user instance since we are using old avatarPublicId to remove it from cloudinary

  if (req.file && updateUser.avatarPublicId) {
    await cloudinary.v2.uploader.destroy(updateUser.avatarPublicId);
  }

  res.status(StatusCodes.OK).json({ msg: 'update user' });
};

export const getAllUsers = async (req, res) => {
  const { userId } = req.user;
  const users = await User.find({ _id: { $ne: userId } });
  res.status(StatusCodes.OK).json({ users });
};

export const friendRequest = async (req, res) => {
  const { userId } = req.user;
  const selectedUserId = req.params.id;

  // add user to friend request
  await User.findByIdAndUpdate(selectedUserId, {
    $push: { ReceiveFriendRequest: userId },
  });

  // update sender's friend request
  await User.findByIdAndUpdate(userId, {
    $push: { sendFriendsRequest: selectedUserId },
  });
  // const
  res.status(StatusCodes.OK).json({ msg: 'friend request' });
};

export const showAllFriendsRequest = async (req, res) => {
  const user = await User.findById(req.user.userId)
    .populate('ReceiveFriendRequest', 'name email image')
    .lean();
  // The lean method is a way to optimize the performance of Mongoose queries by returning plain JavaScript objects instead of Mongoose documents. Mongoose documents have some extra features and methods that make them more powerful and flexible, but also more memory-intensive and slower to process. Sometimes, we don’t need all these features and methods, and we just want to get the raw data from the database. In that case, we can use the lean method to speed up our queries and reduce memory usage.

  res
    .status(StatusCodes.OK)
    .json({ friendsRequest: user.ReceiveFriendRequest });
};

export const acceptFriendRequest = async (req, res) => {
  const requestSenderId = req.params.id;

  const user = await User.findById(req.user.userId);
  const sender = await User.findById(requestSenderId);

  user.friends.push(requestSenderId);
  sender.friends.push(req.user.userId);

  user.ReceiveFriendRequest = user.ReceiveFriendRequest.filter(
    (request) => request.toString() !== requestSenderId
  );

  sender.sendFriendsRequest = sender.sendFriendsRequest.filter(
    (request) => request.toString() !== req.user.userId
  );

  await user.save();
  await sender.save();

  res
    .status(StatusCodes.OK)
    .json({ msg: 'friend request accepted successfully' });
};

export const getAcceptedFriends = async (req, res) => {
  const user = await User.findById(req.user.userId).populate(
    'friends',
    'name email image'
  );
  const friends = user.friends;

  res.status(StatusCodes.OK).json({ friends });
};
