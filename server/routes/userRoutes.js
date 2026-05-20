import express from 'express';
import {
  getVehicles,
  addVehicle,
  getPayments,
  getReviews,
  createReview,
  getNotifications,
  markNotificationRead
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/vehicles')
  .get(protect, getVehicles)
  .post(protect, addVehicle);

router.get('/payments', protect, getPayments);

router.route('/reviews')
  .get(getReviews)
  .post(protect, createReview);

router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

export default router;
