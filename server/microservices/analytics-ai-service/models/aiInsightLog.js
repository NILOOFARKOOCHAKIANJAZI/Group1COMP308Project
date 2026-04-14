// analytics-ai-service/models/aiInsightLog.js
import mongoose from 'mongoose';

const aiInsightLogSchema = new mongoose.Schema(
  {
    insightType: {
      type: String,
      enum: ['classification', 'summary', 'trend', 'chatbot'],
      required: [true, 'Insight type is required.'],
      index: true,
    },
    relatedIssueId: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    requestedByUserId: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    requestedByUsername: {
      type: String,
      default: '',
      trim: true,
    },
    prompt: {
      type: String,
      required: [true, 'Prompt is required.'],
      trim: true,
    },
    responseText: {
      type: String,
      required: [true, 'Response text is required.'],
      trim: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const AIInsightLog = mongoose.model('AIInsightLog', aiInsightLogSchema);

export default AIInsightLog;