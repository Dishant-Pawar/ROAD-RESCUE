import Vehicle from '../models/Vehicle.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import Mechanic from '../models/Mechanic.js';

// --- VEHICLE CONTROLLERS ---

// @desc    Get user vehicles
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id });
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    next(error);
  }
};

// @desc    Add vehicle
// @route   POST /api/vehicles
// @access  Private
export const addVehicle = async (req, res, next) => {
  try {
    const { make, model, year, color, plateNumber, vehicleType } = req.body;

    const vehicle = await Vehicle.create({
      owner: req.user._id,
      make,
      model,
      year,
      color,
      plateNumber,
      vehicleType
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

// --- PAYMENT CONTROLLERS ---

// @desc    Get user payments / invoice history
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res, next) => {
  try {
    let query = {};
    if (req.userRole !== 'admin') {
      query.user = req.user._id;
    }
    const payments = await Payment.find(query).populate('serviceRequest').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

// --- REVIEW CONTROLLERS ---

// @desc    Get reviews
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().populate('user', 'name').populate('mechanic', 'name');
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res, next) => {
  try {
    const { mechanicId, serviceRequestId, rating, comment } = req.body;

    const review = await Review.create({
      user: req.user._id,
      mechanic: mechanicId,
      serviceRequest: serviceRequestId,
      rating,
      comment
    });

    // Update mechanic rating and reviewsCount average
    const mechanic = await Mechanic.findById(mechanicId);
    if (mechanic) {
      const oldRatingSum = mechanic.rating * mechanic.reviewsCount;
      const newReviewsCount = mechanic.reviewsCount + 1;
      const newRating = (oldRatingSum + rating) / newReviewsCount;
      
      mechanic.reviewsCount = newReviewsCount;
      mechanic.rating = Math.round(newRating * 10) / 10;
      await mechanic.save();
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// --- NOTIFICATION CONTROLLERS ---

// @desc    Get notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
      recipientType: req.userRole.charAt(0).toUpperCase() + req.userRole.slice(1) // Map role 'user' -> 'User'
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to read this notification' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};
