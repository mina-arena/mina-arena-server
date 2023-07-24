import express from 'express';
import { ApolloServer, ApolloServerPlugin } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import createNewRelicPlugin from '@newrelic/apollo-server-plugin';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';

import typeDefs from './graphql/schema.js';
import resolvers from './graphql/resolvers.js';

import dbInit from './db/init.js';

import dotenv from 'dotenv';
import { GameProgram, PhaseProgram, TurnProgram } from 'mina-arena-contracts';

dotenv.config();

dbInit();

const app = express();
const webPort = process.env.PORT || 3000;
const websocketPort = 443;

const httpServer = http.createServer(app);

const newRelicPlugin = createNewRelicPlugin<ApolloServerPlugin>({});

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), newRelicPlugin],
});
await apolloServer.start();

app.use(cors(), bodyParser.json(), expressMiddleware(apolloServer));

await new Promise((resolve: any) =>
  httpServer.listen({ port: webPort }, resolve)
);
console.log(`Server running on port ${webPort}`);
