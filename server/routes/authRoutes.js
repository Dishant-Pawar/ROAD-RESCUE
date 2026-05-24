import express from 'express';
import {
  registerUser,
  loginUser,
  registerMechanic,
  loginMechanic,
  registerAdmin,
  loginAdmin,
  getMe,
  updateProfile,
  googleLogin,
  getUsers,
  toggleBlockUser,
  deleteUser,
  createDriver,
  updateDriver,
  deleteDriver,
  purgeSystemData
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/register-mechanic', registerMechanic);
router.post('/login-mechanic', loginMechanic);
router.post('/register-admin', registerAdmin);
router.post('/login-admin', loginAdmin);
router.post('/google-login', googleLogin);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

// System Overrides & Administration
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/block', protect, authorize('admin'), toggleBlockUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.post('/drivers', protect, authorize('admin'), createDriver);
router.put('/drivers/:id', protect, authorize('admin'), updateDriver);
router.delete('/drivers/:id', protect, authorize('admin'), deleteDriver);
router.delete('/system/purge', protect, authorize('admin'), purgeSystemData);

export default router;
