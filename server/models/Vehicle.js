import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  make: {
    type: String,
    required: [true, 'Please add a vehicle make'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Please add a vehicle model'],
    trim: true,
  },
  year: {
    type: Number,
  },
  color: {
    type: String,
    trim: true,
  },
  plateNumber: {
    type: String,
    required: [true, 'Please add a license plate number'],
    unique: true,
    trim: true,
  },
  vehicleType: {
    type: String,
    enum: ['Sedan', 'SUV', 'Truck', 'Motorcycle', 'EV', 'Other'],
    default: 'Sedan',
  }
}, {
  timestamps: true,
});

export default mongoose.model('Vehicle', vehicleSchema);
