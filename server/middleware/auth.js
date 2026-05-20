import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Mechanic from '../models/Mechanic.js';
import Admin from '../models/Admin.js';

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'somesecretjwtkey123456');

    // Attach user based on decoded role
    if (decoded.role === 'admin') {
      req.user = await Admin.findById(decoded.id);
    } else if (decoded.role === 'mechanic') {
      req.user = await Mechanic.findById(decoded.id);
    } else {
      req.user = await User.findById(decoded.id);
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User or technician not found' });
    }

    req.userRole = decoded.role; // Helper to identify role directly
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Optional protect route (does not error out if not logged in)
export const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'somesecretjwtkey123456');
    if (decoded.role === 'admin') {
      req.user = await Admin.findById(decoded.id);
    } else if (decoded.role === 'mechanic') {
      req.user = await Mechanic.findById(decoded.id);
    } else {
      req.user = await User.findById(decoded.id);
    }
    req.userRole = decoded.role;
    next();
  } catch (err) {
    next(); // Move forward without setting req.user
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.userRole || 'guest'} is not authorized to access this route`,
      });
    }
    next();
  };
};
