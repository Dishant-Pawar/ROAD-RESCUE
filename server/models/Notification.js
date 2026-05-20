import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientType',
  },
  recipientType: {
    type: String,
    required: true,
    enum: ['User', 'Mechanic', 'Admin'],
  },
  title: {
    type: String,
    required: [true, 'Please add a notification title'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Please add a notification message'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
  }
}, {
  timestamps: true,
});

export default mongoose.model('Notification', notificationSchema);
