import express from 'express';
import {
  registerUser,
  loginUser,
  registerMechanic,
  loginMechanic,
  registerAdmin,
  loginAdmin,
  getMe,
  googleLogin
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/register-mechanic', registerMechanic);
router.post('/login-mechanic', loginMechanic);
router.post('/register-admin', registerAdmin);
router.post('/login-admin', loginAdmin);
router.post('/google-login', googleLogin);
router.get('/me', protect, getMe);

export default router;
