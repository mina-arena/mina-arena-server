## mina-arena-server

Node server for Mina Arena.

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

#### Migrations

This app uses [Sequelize](https://sequelize.org/docs/v6/getting-started/), migrations can be run like so:

```bash
npx sequelize-cli db:migrate
```

Status of migrations can be checked like so:

```bash
npx sequelize-cli db:migrate:status
```

More info on Sequelize migrations at [https://sequelize.org/docs/v6/other-topics/migrations/](https://sequelize.org/docs/v6/other-topics/migrations/)

#### GraphiQL

This server hosts its GraphQL API at `/graphql`.

You can interact with GraphiQL to test queries at that endpoint.
