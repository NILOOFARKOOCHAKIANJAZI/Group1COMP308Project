// community-service/models/issueReaction.js
import mongoose from 'mongoose';

const issueReactionSchema = new mongoose.Schema(
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
    reactionType: {
      type: String,
      enum: ['upvote'],
      default: 'upvote',
    },
  },
  {
    timestamps: true,
  }
);

issueReactionSchema.index(
  { issueId: 1, userId: 1, reactionType: 1 },
  { unique: true }
);

const IssueReaction = mongoose.model('IssueReaction', issueReactionSchema);

export default IssueReaction;