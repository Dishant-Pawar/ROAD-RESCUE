import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Make optional to support unauthenticated SOS if needed, but typically required
  },
  type: {
    type: String,
    required: [true, 'Please specify service type'],
  },
  issue: {
    type: String,
    required: [true, 'Please specify issue category'],
  },
  time: {
    type: String,
    default: 'Just now',
  },
  loc: {
    type: String,
    default: 'Sector 4 - Downtown Grid',
  },
  location: {
    lat: { type: Number, default: 28.6304 },
    lng: { type: Number, default: 77.2177 }
  },
  req: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  customerVehicle: {
    type: String,
    default: '',
  },
  assigned: {
    type: Boolean,
    default: false,
  },
  eta: {
    type: Number,
    default: null,
  },
  mechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mechanic',
    default: null,
  },
  driverName: {
    type: String,
    default: '',
  },
  driverPhone: {
    type: String,
    default: '',
  },
  driverAvatar: {
    type: String,
    default: '',
  },
  vehicle: {
    type: String,
    default: '',
  },
  chatHistory: [
    {
      sender: {
        type: String,
        enum: ['user', 'system', 'mechanic', 'david', 'admin'],
      },
      text: {
        type: String,
        required: true,
      },
      time: {
        type: String,
        default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    }
  ]
}, {
  timestamps: true,
});

export default mongoose.model('ServiceRequest', serviceRequestSchema);
