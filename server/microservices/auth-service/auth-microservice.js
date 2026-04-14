// auth-service/auth-microservice.js
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';

import connectDB from './config/mongoose.js';
import { config } from './config/config.js';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';
import { parse } from 'graphql';
import { buildSubgraphSchema } from '@apollo/subgraph';

const app = express();

// Connect to MongoDB
connectDB();

// General middleware
app.use(
  cors({
    origin: config.clientOrigins,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const schema = buildSubgraphSchema([
  {
    typeDefs: parse(typeDefs),
    resolvers,
  },
]);

const server = new ApolloServer({
  schema,
  introspection: true,
});

const getUserFromRequest = (req) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    return {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
};

const startServer = async () => {
  try {
    await server.start();

    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req, res }) => {
          const user = getUserFromRequest(req);

          return {
            req,
            res,
            user,
          };
        },
      })
    );

    app.get('/', (_, res) => {
      res.send('Auth Service is running.');
    });

    app.listen(config.port, () => {
      console.log(`🚀 Auth Service ready at http://localhost:${config.port}/graphql`);
    });
  } catch (error) {
    console.error('Failed to start Auth Service:', error.message);
  }
};

startServer();