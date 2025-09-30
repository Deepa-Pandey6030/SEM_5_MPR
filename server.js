import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import productsRouter from './src/routes/products.js';
import usersRouter from './src/routes/users.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));