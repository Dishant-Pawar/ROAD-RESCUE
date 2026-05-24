import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const mechanicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a mechanic name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    default: 'mechanic',
  },
  avatar: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    required: [true, 'Please add a contact phone number'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  city: {
    type: String,
    default: '',
  },
  drivingLicense: {
    type: String,
    default: '',
  },
  specialty: {
    type: String,
    default: 'General Assistance', // e.g. Towing, Battery, Engine Diagnostics
  },
  vehicle: {
    name: { type: String, default: 'Heavy Tow • Unit #402' },
    plate: { type: String, default: 'RD-RESC-9' }
  },
  location: {
    lat: { type: Number, default: 28.6304 },
    lng: { type: Number, default: 77.2177 },
    address: { type: String, default: 'Downtown, Sector 4' }
  },
  rating: {
    type: Number,
    default: 5.0,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

// Encrypt password using bcrypt
mechanicSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match mechanic entered password to hashed password
mechanicSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Mechanic', mechanicSchema);
