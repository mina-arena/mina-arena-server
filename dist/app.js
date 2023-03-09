import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import typeDefs from './graphql/schema.js';
import resolvers from './graphql/resolvers.js';
import dbInit from './db/init.js';
dbInit();
const app = express();
const webPort = process.env.PORT || 3000;
const websocketPort = 443;
const httpServer = http.createServer(app);
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await apolloServer.start();
app.use(cors(), bodyParser.json(), expressMiddleware(apolloServer));
await new Promise((resolve) => httpServer.listen({ port: webPort }, resolve));
console.log(`Server running on port ${webPort}`);
//# sourceMappingURL=app.js.map