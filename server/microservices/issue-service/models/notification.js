// issue-service/models/notification.js
import mongoose from 'mongoose';

const allowedTypes = ['status_update', 'urgent_alert', 'assignment', 'general'];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required.'],
      index: true,
    },
    issueId: {
      type: String,
      required: [true, 'Issue ID is required.'],
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required.'],
      trim: true,
      maxlength: [500, 'Notification message must not exceed 500 characters.'],
    },
    type: {
      type: String,
      enum: allowedTypes,
      default: 'general',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;