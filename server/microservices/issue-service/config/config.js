// issue-service/config/config.js
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  db: process.env.ISSUE_MONGO_URI || 'mongodb://127.0.0.1:27017/civiccase_issue_db',
  jwtSecret: process.env.JWT_SECRET || 'fallback_jwt_secret_change_me',
  port: process.env.ISSUE_PORT || 4002,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigins: (
    process.env.CLIENT_ORIGINS ||
    'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:4000,https://studio.apollographql.com'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

if (config.nodeEnv !== 'production') {
  console.log('===== Issue Service Configuration =====');
  console.log(`ISSUE_PORT: ${config.port}`);
  console.log(`ISSUE_MONGO_URI: ${config.db}`);
  console.log(`NODE_ENV: ${config.nodeEnv}`);
  console.log('=======================================');
}