import { StatusCodes } from 'http-status-codes';
import Message from '../models/MessageModel.js';
import cloudinary from 'cloudinary';
import { formatImage } from '../middleware/multerMiddleware.js';
import mongoose from 'mongoose';

export const sendMessage = async (req, res) => {
  let { messageType, message } = req.body;
  const { receiverId } = req.params;
  let messagePublicId;

  if (req.file) {
    const file = formatImage(req.file);
    const response = await cloudinary.v2.uploader.upload(file);
    message = response.secure_url;
    messagePublicId = response.public_id;
  }

  await Message.create({
    senderId: req.user.userId,
    receiverId,
    messageType,
    message,
    messagePublicId,
  });

  res.status(StatusCodes.OK).json({ msg: 'Message sent successfully' });
};

export const conversation = async (req, res) => {
  const { receiverId } = req.params;

  const messages = await Message.find({
    $or: [
      { senderId: req.user.userId, receiverId: receiverId },
      { senderId: receiverId, receiverId: req.user.userId },
    ],
  }).populate('senderId', '_id name');

  res.status(StatusCodes.OK).json(messages);
};

export const deleteMessages = async (req, res) => {
  const { messagesIds } = req.body;

  // delete all message where messageType=="text"
  await Message.deleteMany({ _id: { $in: messagesIds }, messageType: 'text' });

  // storing messages
  const messages = await Message.find({
    _id: { $in: messagesIds },
    messageType: 'image',
  });

  // delete images from message
  await Message.deleteMany({
    _id: { $in: messagesIds },
    messageType: 'image',
  });

  // delete image from cloudinary
  messages.forEach(async (message) => {
    await cloudinary.v2.uploader.destroy(message.messagePublicId);
  });

  res.status(StatusCodes.OK).json({ msg: 'Messages deleted successfully' });
};
