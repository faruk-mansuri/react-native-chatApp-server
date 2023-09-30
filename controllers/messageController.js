import { StatusCodes } from 'http-status-codes';
import Message from '../models/MessageModel.js';
import cloudinary from 'cloudinary';
import { formatImage } from '../middleware/multerMiddleware.js';

export const getAllMessage = (req, res) => {
  res.send('get all message');
};

export const sendMessage = async (req, res) => {
  let { messageType, message } = req.body;
  const { receiverId } = req.params;
  if (req.file) {
    const file = formatImage(req.file);
    const response = await cloudinary.v2.uploader.upload(file);
    message = response.secure_url;
  }

  const newMessage = await Message.create({
    senderId: req.user.userId,
    receiverId,
    messageType,
    message,
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
export const receiveMessage = (req, res) => {
  res.send('message receive');
};
