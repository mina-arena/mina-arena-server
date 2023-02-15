import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import schema from './graphql/schema.js';
import root from './graphql/resolvers.js';

const app = express();
const webPort = 3000;
const websocketPort = 443;

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(webPort, () => {
  console.log(`Web server listening on port ${webPort}`)
});
