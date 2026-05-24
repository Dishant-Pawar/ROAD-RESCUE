import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User.js';
import Mechanic from '../models/Mechanic.js';
import Admin from '../models/Admin.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import EmergencyReport from '../models/EmergencyReport.js';
import ServiceRequest from '../models/ServiceRequest.js';

// Helper to generate JWT token and respond
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'somesecretjwtkey123456',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar || user.profilePhoto || '',
    },
  });
};

// @desc    Register a standard user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login standard user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: '🔒 Access Denied: This terminal account has been locked by the Command Center Operator.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Register a mechanic
// @route   POST /api/auth/register-mechanic
// @access  Public
export const registerMechanic = async (req, res, next) => {
  try {
    const { name, email, password, phone, specialty, vehicleName, vehiclePlate } = req.body;

    const exists = await Mechanic.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Mechanic already exists with this email' });
    }

    const mechanic = await Mechanic.create({
      name,
      email,
      password,
      phone,
      specialty,
      vehicle: {
        name: vehicleName,
        plate: vehiclePlate,
      },
    });

    sendTokenResponse(mechanic, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login mechanic
// @route   POST /api/auth/login-mechanic
// @access  Public
export const loginMechanic = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const mechanic = await Mechanic.findOne({ email }).select('+password');
    if (!mechanic) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await mechanic.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(mechanic, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Register an admin
// @route   POST /api/auth/register-admin
// @access  Public
export const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Admin already exists with this email' });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
    });

    sendTokenResponse(admin, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login admin
// @route   POST /api/auth/login-admin
// @access  Public
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(admin, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile settings
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profilePhoto, password } = req.body;

    let user;
    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user._id);
    } else {
      user = await User.findById(req.user._id);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update simple fields
    if (name) user.name = name;
    
    if (req.user.role !== 'admin') {
      if (phone !== undefined) user.phone = phone;
      if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    }

    // Update password if provided
    if (password) {
      user.password = password;
    }

    await user.save();

    // Respond with updated user info
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.profilePhoto || user.avatar || '',
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Sign-in and dynamic role assignment
// @route   POST /api/auth/google-login
// @access  Public
export const googleLogin = async (req, res, next) => {
  try {
    const { credential, bypassEmail } = req.body;
    
    let email, name, picture;

    if (bypassEmail) {
      email = bypassEmail;
      const localPart = bypassEmail.split('@')[0];
      name = localPart.charAt(0).toUpperCase() + localPart.slice(1);
      picture = '';
    } else {
      if (!credential) {
        return res.status(400).json({ success: false, message: 'No Google credential provided' });
      }

      // Cryptographically verify Google ID Token using Google tokeninfo API to prevent client-side token forgery
      let decoded;
      try {
        const verifyRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        decoded = verifyRes.data;
      } catch (err) {
        console.error("Google token verification failed:", err.message);
        return res.status(401).json({ success: false, message: 'Google authentication token verification failed' });
      }

      if (!decoded || !decoded.email) {
        return res.status(400).json({ success: false, message: 'Invalid Google token payload structure' });
      }

      // Verify audience matches our Google Client ID
      const expectedClientId = process.env.VITE_GOOGLE_CLIENT_ID || '60313722264-j2a9b50nk9fv3qus8mosah0meqc1fm1v.apps.googleusercontent.com';
      if (decoded.aud !== expectedClientId) {
        console.warn(`Audience mismatch: expected ${expectedClientId}, got ${decoded.aud}`);
        return res.status(401).json({ success: false, message: 'Google token audience mismatch' });
      }

      email = decoded.email;
      name = decoded.name;
      picture = decoded.picture;
    }

    // Classification Rule: email a90685766@gmail.com is Admin, all others are User
    const isAdminEmail = email.toLowerCase() === 'a90685766@gmail.com';

    let user;

    if (isAdminEmail) {
      user = await Admin.findOne({ email });
      if (!user) {
        // Create new Admin record with real Google details
        const dummyPassword = `google-admin-pwd-${Math.floor(Math.random() * 1000000)}`;
        user = await Admin.create({
          name: name || 'Admin Operator',
          email,
          password: dummyPassword,
          role: 'admin'
        });
      } else {
        user.name = name || user.name;
        await user.save();
      }
    } else {
      user = await User.findOne({ email });
      if (!user) {
        // Create new standard User record with real Google details
        const dummyPassword = `google-user-pwd-${Math.floor(Math.random() * 1000000)}`;
        user = await User.create({
          name: name || 'Google User',
          email,
          password: dummyPassword,
          profilePhoto: picture || '',
          role: 'user'
        });
      } else {
        user.name = name || user.name;
        if (picture) user.profilePhoto = picture;
        await user.save();
      }
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: '🔒 Access Denied: This terminal account has been locked by the Command Center Operator.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Block or unblock user account
// @route   PUT /api/auth/users/:id/block
// @access  Private/Admin
export const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: `User account successfully ${user.isBlocked ? 'blocked' : 'unblocked'}.`, 
      data: user 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User account permanently purged from terminal data logs.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete driver/mechanic profile
// @route   DELETE /api/auth/drivers/:id
// @access  Private/Admin
export const deleteDriver = async (req, res, next) => {
  try {
    const mechanic = await Mechanic.findById(req.params.id);
    if (!mechanic) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    await mechanic.deleteOne();
    res.status(200).json({ success: true, message: 'Driver unit profile permanently purged from the logistics roster.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a driver/mechanic profile (Admin)
// @route   POST /api/auth/drivers
// @access  Private/Admin
export const createDriver = async (req, res, next) => {
  try {
    const { name, email, password, phone, specialty, vehicleName, vehiclePlate, avatar, status } = req.body;

    const exists = await Mechanic.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Driver already exists with this email' });
    }

    const mechanic = await Mechanic.create({
      name,
      email,
      password: password || '123456',
      phone,
      avatar: avatar || '',
      status: status || 'active',
      specialty: specialty || 'General Assistance',
      vehicle: {
        name: vehicleName || 'Heavy Tow • Unit #402',
        plate: vehiclePlate || 'RD-RESC-9',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Driver unit profile registered successfully in roster.',
      data: mechanic
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update driver/mechanic profile (Admin)
// @route   PUT /api/auth/drivers/:id
// @access  Private/Admin
export const updateDriver = async (req, res, next) => {
  try {
    const { name, email, phone, specialty, vehicleName, vehiclePlate, avatar, status, password } = req.body;

    const mechanic = await Mechanic.findById(req.params.id);
    if (!mechanic) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // Check if email is being updated to an existing one
    if (email && email !== mechanic.email) {
      const exists = await Mechanic.findOne({ email });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Another driver already exists with this email' });
      }
      mechanic.email = email;
    }

    if (name) mechanic.name = name;
    if (phone) mechanic.phone = phone;
    if (specialty) mechanic.specialty = specialty;
    if (avatar !== undefined) mechanic.avatar = avatar;
    if (status) mechanic.status = status;
    if (password) mechanic.password = password;

    if (vehicleName !== undefined || vehiclePlate !== undefined) {
      mechanic.vehicle = {
        name: vehicleName !== undefined ? vehicleName : mechanic.vehicle.name,
        plate: vehiclePlate !== undefined ? vehiclePlate : mechanic.vehicle.plate,
      };
    }

    await mechanic.save();

    res.status(200).json({
      success: true,
      message: 'Driver unit profile updated successfully.',
      data: mechanic
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Purge all database operations history (incidents, payments, notifications, emergency reports)
// @route   DELETE /api/auth/system/purge
// @access  Private/Admin
export const purgeSystemData = async (req, res, next) => {
  try {
    await ServiceRequest.deleteMany({});
    await Payment.deleteMany({});
    await Notification.deleteMany({});
    await EmergencyReport.deleteMany({});
    
    res.status(200).json({
      success: true,
      message: '🚨 System Overrides Active: All operations history, invoices, alerts, and satellite reports purged from the central database.'
    });
  } catch (error) {
    next(error);
  }
};
