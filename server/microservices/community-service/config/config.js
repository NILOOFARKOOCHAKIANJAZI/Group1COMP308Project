// community-service/config/config.js
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  db: process.env.COMMUNITY_MONGO_URI || 'mongodb://127.0.0.1:27017/civiccase_community_db',
  jwtSecret: process.env.JWT_SECRET || 'fallback_jwt_secret_change_me',
  port: process.env.COMMUNITY_PORT || 4003,
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
  console.log('===== Community Service Configuration =====');
  console.log(`COMMUNITY_PORT: ${config.port}`);
  console.log(`COMMUNITY_MONGO_URI: ${config.db}`);
  console.log(`NODE_ENV: ${config.nodeEnv}`);
  console.log('===========================================');
}