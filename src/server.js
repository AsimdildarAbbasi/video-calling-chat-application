import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Added import
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import { connectDB } from './lib/db.js';
import userRoute from '../src/routes/user.route.js';
import chatRoutes from '../src/routes/chatRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 5001; // fallback in case PORT is not set
const app = express(); // Moved up

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true // Fixed typo
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoute);
app.use("/api/chat", chatRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the The Backend Show!');
});

connectDB(); // Call before listen
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
