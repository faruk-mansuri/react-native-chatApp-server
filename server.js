import 'express-async-errors';
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();

import morgan from 'morgan';
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
import cors from 'cors';

// routers
import AuthRouter from './routes/AuthRoute.js';
import UserRouter from './routes/UserRoute.js';
import MessageRouter from './routes/MessageRoute.js';

// middleware
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';
import { authenticateUser } from './middleware/authMiddleware.js';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/users', authenticateUser, UserRouter);
app.use('/api/v1/messages', authenticateUser, MessageRouter);

app.use('*', (req, res) => {
  res.status(404).json({ msg: 'no found' });
});

app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, console.log(`server is listening on port ${port}... `));
} catch (err) {
  console.log(err);
  process.exit(1);
}
