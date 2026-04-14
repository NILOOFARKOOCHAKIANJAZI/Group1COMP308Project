// issue-service/models/issue.js
import mongoose from 'mongoose';

const allowedCategories = [
  'pothole',
  'broken_streetlight',
  'flooding',
  'sidewalk_damage',
  'garbage',
  'graffiti',
  'traffic_signal',
  'safety_hazard',
  'other',
];

const allowedPriorities = ['low', 'medium', 'high', 'critical'];

const allowedStatuses = [
  'reported',
  'under_review',
  'assigned',
  'in_progress',
  'resolved',
  'closed',
];

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Issue title is required.'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long.'],
      maxlength: [150, 'Title must not exceed 150 characters.'],
    },
    description: {
      type: String,
      required: [true, 'Issue description is required.'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long.'],
      maxlength: [2000, 'Description must not exceed 2000 characters.'],
    },

    category: {
      type: String,
      enum: allowedCategories,
      default: 'other',
    },
    aiCategory: {
      type: String,
      trim: true,
      default: '',
    },
    aiSummary: {
      type: String,
      trim: true,
      default: '',
    },

    priority: {
      type: String,
      enum: allowedPriorities,
      default: 'medium',
    },
    status: {
      type: String,
      enum: allowedStatuses,
      default: 'reported',
    },

    photoUrl: {
      type: String,
      trim: true,
      default: '',
    },

    location: {
      address: {
        type: String,
        trim: true,
        default: '',
      },
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      neighborhood: {
        type: String,
        trim: true,
        default: '',
      },
    },

    reportedBy: {
      type: String,
      required: [true, 'Reporter user ID is required.'],
      index: true,
    },
    reportedByUsername: {
      type: String,
      required: [true, 'Reporter username is required.'],
      trim: true,
    },

    assignedTo: {
      type: String,
      default: '',
      index: true,
    },
    assignedToUsername: {
      type: String,
      default: '',
      trim: true,
    },

    urgentAlert: {
      type: Boolean,
      default: false,
    },

    internalNotes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1500, 'Internal notes must not exceed 1500 characters.'],
    },
  },
  {
    timestamps: true,
  }
);

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;