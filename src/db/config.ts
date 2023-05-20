import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import { Sequelize, Dialect } from 'sequelize';

const environment = process.env.NODE_ENV || 'development';
let sequelizeConnection;

if (environment == 'production') {
  // In production we will connect to Postgres using
  // the DATABASE_URL environment variable
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error(`DATABASE_URL environment variable is required to boot in production!`);

  sequelizeConnection = new Sequelize(
    process.env.DATABASE_URL,
    {
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
    }
  );
} else {
  var dbHost: string;
  var dbName: string;
  var dbUser: string;
  var dbPassword: string;
  
  if (environment == 'development') {
    dbHost = process.env.DEV_DB_HOST || 'localhost';
    dbName = process.env.DEV_DB_NAME || 'skirmish_server_poc_development';
    dbUser = process.env.DEV_DB_USERNAME || 'postgres';
    dbPassword = process.env.DEV_DB_PASSWORD;
  } else if (environment == 'test') {
    dbHost = process.env.TEST_DB_HOST || 'localhost';
    dbName = process.env.TEST_DB_NAME || 'skirmish_server_poc_test';
    dbUser = process.env.TEST_DB_USERNAME || 'postgres';
    dbPassword = process.env.TEST_DB_PASSWORD;
  } else {
    throw new Error(`Invalid NODE_ENV ${environment}, must be one of: [development, test, production]`);
  }
  
  const dbDriver: Dialect = 'postgres';
  sequelizeConnection = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: dbDriver,
    logging: environment == 'development'
  });
}

export default sequelizeConnection;