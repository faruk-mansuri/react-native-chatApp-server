import { StatusCodes } from 'http-status-codes';
import Message from '../models/MessageModel.js';

export const getAllMessage = (req, res) => {
  res.send('get all message');
};

export const sendMessage = async (req, res) => {
  const { messageType, message } = req.body;
  const { receiverId } = req.params;

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

  const messages = await Message.findOne({
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
