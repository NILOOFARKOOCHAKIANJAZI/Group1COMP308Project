// server/gateway.js
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import {
  ApolloGateway,
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
} from '@apollo/gateway';

const app = express();

const gatewayPort = process.env.GATEWAY_PORT || 4000;
const clientOrigins = (
  process.env.CLIENT_ORIGINS ||
  'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:4000,https://studio.apollographql.com'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4001/graphql';
const issueServiceUrl = process.env.ISSUE_SERVICE_URL || 'http://localhost:4002/graphql';
const communityServiceUrl =
  process.env.COMMUNITY_SERVICE_URL || 'http://localhost:4003/graphql';
const analyticsAiServiceUrl =
  process.env.ANALYTICS_AI_SERVICE_URL || 'http://localhost:4004/graphql';

app.use(
  cors({
    origin: clientOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    if (context.authorization) {
      request.http.headers.set('authorization', context.authorization);
    }

    if (context.cookie) {
      request.http.headers.set('cookie', context.cookie);
    }
  }

  didReceiveResponse({ response, context }) {
    // Forward Set-Cookie headers from subgraph back to browser
    const setCookieHeader = response.http.headers.get('set-cookie');

    if (setCookieHeader && context.res) {
      context.res.setHeader('set-cookie', setCookieHeader);
    }

    return response;
  }
}

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'auth', url: authServiceUrl },
      { name: 'issues', url: issueServiceUrl },
      { name: 'community', url: communityServiceUrl },
      { name: 'analytics', url: analyticsAiServiceUrl },
    ],
  }),
  buildService({ url }) {
    return new AuthenticatedDataSource({ url });
  },
});

const server = new ApolloServer({
  gateway,
  introspection: true,
});

const startGateway = async () => {
  try {
    await server.start();

    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req, res }) => {
          const authorization = req.headers.authorization || '';
          const cookie = req.headers.cookie || '';

          return {
            authorization,
            cookie,
            res,
          };
        },
      })
    );

    app.get('/', (_, res) => {
      res.send('CivicCase Gateway is running.');
    });

    app.listen(gatewayPort, () => {
      console.log(`🚀 Gateway ready at http://localhost:${gatewayPort}/graphql`);
      console.log('Connected subgraphs:');
      console.log(`- auth: ${authServiceUrl}`);
      console.log(`- issues: ${issueServiceUrl}`);
      console.log(`- community: ${communityServiceUrl}`);
      console.log(`- analytics: ${analyticsAiServiceUrl}`);
    });
  } catch (error) {
    console.error('Failed to start Gateway:', error.message);
  }
};

startGateway();