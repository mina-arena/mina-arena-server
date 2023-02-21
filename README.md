## Skirmish Server POC

Node server for our Skirmish game for ZKIgnite.

### Development

Generate Typescript types for GraphQL schema and compile Typescript into Javascript:
```bash
npm run compile
```

Do the above and also start the server in one command:
```bash
npm run start
```

The server runs on port 3000.

#### GraphiQL

This server hosts its GraphQL API at `/graphql`.

You can interact with GraphiQL to test queries at that endpoint.