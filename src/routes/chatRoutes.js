import express from 'express';
import { protecteRoute } from '../middleware/auth.middleware.js';
import { getStreamToken } from '../controller/chat.Controller.js';
const router = express.Router();

router.get("/token",protecteRoute,getStreamToken)

export default router;