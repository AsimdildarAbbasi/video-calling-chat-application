import express from 'express';
import { signup, login, logout, onboard } from '../controller/auth.controller.js';   
import { protecteRoute } from '../middleware/auth.middleware.js';


const router = express.Router();
router.post('/signup',signup);

router.post('/login', login);

router.post('/logout', logout);
router.post('/onboard',protecteRoute,onboard);
router.get('/me',protecteRoute, (req, res) => {
  res.status(200).json({ user: req.user });
});

export default router;
