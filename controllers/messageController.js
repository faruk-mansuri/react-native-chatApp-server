import MessageSchema from '../models/MessageModel.js';

export const getAllMessage = (req, res) => {
  res.send('get all message');
};

export const sendMessage = (req, res) => {
  res.send('message send');
};

export const receiveMessage = (req, res) => {
  res.send('message receive');
};
