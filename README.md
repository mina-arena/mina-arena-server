## Skirmish Server POC

Node server for our Skirmish game for ZKIgnite.

### Development

#### Compiling Typescript into Javascript

```bash
$ tsc --project tsconfig.json
```

#### Running the server:

```bash
$ node dist/app.js
```

The server runs on port 3000.

#### GraphiQL

This server hosts its GraphQL API at `/graphql`.

You can interact with GraphiQL to test queries at that endpoint.