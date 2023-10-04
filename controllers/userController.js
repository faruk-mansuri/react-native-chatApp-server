import User from '../models/UserModel.js';
import Message from '../models/MessageModel.js';
import { StatusCodes } from 'http-status-codes';
import cloudinary from 'cloudinary';
import { formatImage } from '../middleware/multerMiddleware.js';
import { BadRequestError, NotFoundError } from '../errors/customError.js';

export const getCurrentUser = async (req, res) => {
  // const user = await User.findOne({ _id: req.user.userId }).select('-password');
  const user = await User.findOne({ _id: req.user.userId });
  const userWithoutPassword = user.toJSON();
  res.status(StatusCodes.OK).json({ user: userWithoutPassword });
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
  const users = await User.find({});
  res.status(StatusCodes.OK).json({ users });
};

export const friendRequest = async (req, res) => {
  const { userId } = req.user;
  const selectedUserId = req.params.id;

  const userAlreadyAFriend = await User.exists({
    _id: userId,
    $or: [
      { ReceiveFriendRequest: selectedUserId },
      { friends: selectedUserId },
      { sendFriendsRequest: selectedUserId },
    ],
  });

  if (userAlreadyAFriend) {
    throw new BadRequestError('User Already in connection');
  }

  // add user to friend request
  await User.findByIdAndUpdate(selectedUserId, {
    $push: { ReceiveFriendRequest: userId },
  });

  // update sender's friend request
  await User.findByIdAndUpdate(userId, {
    $push: { sendFriendsRequest: selectedUserId },
  });
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

  const userAlreadyAFriend = await User.exists({
    _id: req.user.userId,
    friends: requestSenderId,
  });

  if (userAlreadyAFriend) {
    throw new BadRequestError('User Already in connection');
  }

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
    'name email avatar'
  );
  const friends = user.friends;

  res.status(StatusCodes.OK).json({ friends });
};

export const getSentFriendRequest = async (req, res) => {
  const user = await User.findById(req.user.userId).populate(
    'sendFriendsRequest',
    'name email avatar'
  );
  const sentFriendRequests = user.sendFriendsRequest;
  res.status(StatusCodes.OK).json({ sentFriendRequests });
};

export const getAllFriends = async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (user.friends.length < 1)
    throw new NotFoundError("Currently you don't have any friends");

  // const friendsIds = user.friends.map((friend) => friend._id);
  res.status(StatusCodes.OK).json({ friendsIds: user.friends });
};

export const deleteProfile = async (req, res) => {
  // find all messages
  const deletedMessages = await Message.find(
    {
      $or: [{ senderId: req.user.userId }, { receiverId: req.user.userId }],
    },
    '_id'
  );

  const deleteMessagesIds = deletedMessages.map((message) =>
    message._id.toString()
  );

  // delete all message where messageType === "text"
  await Message.deleteMany({
    _id: { $in: deleteMessagesIds },
    messageType: 'text',
  });

  // storing messagesType === "image"
  const imageMessagesId = await Message.find({
    _id: { $in: deleteMessagesIds },
    messageType: 'image',
  });

  // delete images from message
  await Message.deleteMany({
    _id: { $in: imageMessagesId },
    messageType: 'image',
  });

  // delete image from cloudinary
  imageMessagesId.forEach(async (message) => {
    await cloudinary.v2.uploader.destroy(message.messagePublicId);
  });

  // remove user from friends, ReceiveFriendRequest and sendFriendsRequest from others users list
  await User.updateMany(
    {
      $or: [
        { ReceiveFriendRequest: req.user.userId },
        { friends: req.user.userId },
        { sendFriendsRequest: req.user.userId },
      ],
    },
    {
      $pull: {
        ReceiveFriendRequest: req.user.userId,
        friends: req.user.userId,
        sendFriendsRequest: req.user.userId,
      },
    }
  );

  // remove profile image from cloudinary
  const user = await User.findById(req.user.userId);
  if (user.avatarPublicId) {
    await cloudinary.v2.uploader.destroy(user.avatarPublicId);
  }

  await User.findByIdAndDelete(req.user.userId);

  res.status(StatusCodes.OK).json({ msg: 'user deleted successfully' });
};

export const deleteProfileByAdmin = async (req, res) => {
  const { userId } = req.params;

  // find all messages
  const deletedMessages = await Message.find(
    {
      $or: [{ senderId: userId }, { receiverId: userId }],
    },
    '_id'
  );

  const deleteMessagesIds = deletedMessages.map((message) =>
    message._id.toString()
  );

  // delete all message where messageType === "text"
  await Message.deleteMany({
    _id: { $in: deleteMessagesIds },
    messageType: 'text',
  });

  // storing messagesType === "image"
  const imageMessagesId = await Message.find({
    _id: { $in: deleteMessagesIds },
    messageType: 'image',
  });

  // delete images from message
  await Message.deleteMany({
    _id: { $in: imageMessagesId },
    messageType: 'image',
  });

  // delete image from cloudinary
  imageMessagesId.forEach(async (message) => {
    await cloudinary.v2.uploader.destroy(message.messagePublicId);
  });

  // remove user from friends, ReceiveFriendRequest and sendFriendsRequest from others users list
  await User.updateMany(
    {
      $or: [
        { ReceiveFriendRequest: userId },
        { friends: userId },
        { sendFriendsRequest: userId },
      ],
    },
    {
      $pull: {
        ReceiveFriendRequest: userId,
        friends: userId,
        sendFriendsRequest: userId,
      },
    }
  );

  // remove profile image from cloudinary
  const user = await User.findById(userId);
  if (user.avatarPublicId) {
    await cloudinary.v2.uploader.destroy(user.avatarPublicId);
  }

  await User.findByIdAndDelete(userId);

  res.status(StatusCodes.OK).json({ msg: 'user deleted successfully' });
};
