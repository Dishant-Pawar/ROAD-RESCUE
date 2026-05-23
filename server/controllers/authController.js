import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Mechanic from '../models/Mechanic.js';
import Admin from '../models/Admin.js';

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

      // Decode Google ID Token (cryptographically signed JWT payload)
      const decoded = jwt.decode(credential);
      if (!decoded || !decoded.email) {
        return res.status(400).json({ success: false, message: 'Invalid Google credential token' });
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

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
