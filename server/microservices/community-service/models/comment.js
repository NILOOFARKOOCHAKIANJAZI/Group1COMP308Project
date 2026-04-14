// community-service/models/comment.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
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
    role: {
      type: String,
      enum: ['resident', 'staff', 'advocate'],
      required: [true, 'User role is required.'],
    },
    content: {
      type: String,
      required: [true, 'Comment content is required.'],
      trim: true,
      minlength: [2, 'Comment must be at least 2 characters long.'],
      maxlength: [1000, 'Comment must not exceed 1000 characters.'],
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;