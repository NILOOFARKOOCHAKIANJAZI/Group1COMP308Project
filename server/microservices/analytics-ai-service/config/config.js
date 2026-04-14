// analytics-ai-service/config/config.js
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  db: process.env.ANALYTICS_AI_MONGO_URI || 'mongodb://127.0.0.1:27017/civiccase_analytics_ai_db',
  issueDb: process.env.ISSUE_MONGO_URI || 'mongodb://127.0.0.1:27017/civiccase_issue_db',
  communityDb: process.env.COMMUNITY_MONGO_URI || 'mongodb://127.0.0.1:27017/civiccase_community_db',

  jwtSecret: process.env.JWT_SECRET || 'fallback_jwt_secret_change_me',
  port: process.env.ANALYTICS_AI_PORT || 4004,
  nodeEnv: process.env.NODE_ENV || 'development',

  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',

  clientOrigins: (
    process.env.CLIENT_ORIGINS ||
    'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:4000,https://studio.apollographql.com'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

if (config.nodeEnv !== 'production') {
  console.log('===== Analytics AI Service Configuration =====');
  console.log(`ANALYTICS_AI_PORT: ${config.port}`);
  console.log(`ANALYTICS_AI_MONGO_URI: ${config.db}`);
  console.log(`ISSUE_MONGO_URI: ${config.issueDb}`);
  console.log(`COMMUNITY_MONGO_URI: ${config.communityDb}`);
  console.log(`GEMINI_MODEL: ${config.geminiModel}`);
  console.log(`GEMINI_API_KEY configured: ${Boolean(config.geminiApiKey)}`);
  console.log('==============================================');
}