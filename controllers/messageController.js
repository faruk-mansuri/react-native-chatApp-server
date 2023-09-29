import Message from '../models/MessageModel.js';

export const getAllMessage = (req, res) => {
  res.send('get all message');
};

export const sendMessage = async (req, res) => {
  const { messageType, message } = req.body;
  const { receiverId } = req.params;
  const data = { senderId: req.user.userId, receiverId, messageType, message };
  // const newMessage = await Message

  res.send('message send');
};

export const receiveMessage = (req, res) => {
  res.send('message receive');
};
