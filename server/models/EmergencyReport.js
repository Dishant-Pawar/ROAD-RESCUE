import mongoose from 'mongoose';

const emergencyReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Can be anonymous or registered
  },
  type: {
    type: String,
    required: [true, 'Please specify emergency type'],
    trim: true,
  },
  issue: {
    type: String,
    required: [true, 'Please provide details of the emergency/issue'],
    trim: true,
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String, required: true }
  },
  photoUrl: {
    type: String,
    default: '',
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  contactPhone: {
    type: String,
    required: [true, 'Please provide a contact phone number'],
  },
  status: {
    type: String,
    enum: ['Reported', 'Reviewed', 'Dispatched', 'Resolved'],
    default: 'Reported',
  }
}, {
  timestamps: true,
});

export default mongoose.model('EmergencyReport', emergencyReportSchema);
