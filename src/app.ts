import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';

import typeDefs from './graphql/schema.js';
import resolvers from './graphql/resolvers.js';

import dbInit from './db/init.js';

dbInit();

const app = express();
const webPort: number = 3000;
const websocketPort: number = 443;

const httpServer = http.createServer(app);

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await apolloServer.start();

app.use(
  cors(),
  bodyParser.json(),
  expressMiddleware(apolloServer),
);

await new Promise((resolve: any) => httpServer.listen({ port: webPort }, resolve));
console.log(`Server running on port ${webPort}`);

// Example of how to query a table using Sequelize
// See https://sequelize.org/v5/manual/models-usage.html#data-retrieval---finders
import { Player } from './models/index.js';

var players = await Player.findAll();
console.log('players.length = ' + players.length);
console.log('players...');
players.forEach(player => {
  console.log(
    'id: ' + player.id + ', ' +
    'name: ' + player.name + ', ' +
    'minaPublicKey: ' + player.minaPublicKey
  );
});
