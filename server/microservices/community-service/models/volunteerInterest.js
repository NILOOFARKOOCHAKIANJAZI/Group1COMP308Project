// community-service/models/volunteerInterest.js
import mongoose from 'mongoose';

const volunteerInterestSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      required: [true, 'Issue ID is required.'],
      index: true,
      trim: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required.'],
      index: true,
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required.'],
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Volunteer message must not exceed 1000 characters.'],
      default: '',
    },
    status: {
      type: String,
      enum: ['interested', 'contacted', 'matched', 'closed'],
      default: 'interested',
    },
  },
  {
    timestamps: true,
  }
);

volunteerInterestSchema.index(
  { issueId: 1, userId: 1 },
  { unique: true }
);

const VolunteerInterest = mongoose.model('VolunteerInterest', volunteerInterestSchema);

export default VolunteerInterest;