import dotenv from 'dotenv';
dotenv.config();

import { Sequelize, Dialect } from 'sequelize';

const environment = process.env.NODE_ENV || 'development';

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
} else if (environment == 'production') {
  dbHost = process.env.PROD_DB_HOST;
  dbName = process.env.PROD_DB_NAME;
  dbUser = process.env.PROD_DB_USERNAME;
  dbPassword = process.env.PROD_DB_PASSWORD;
} else {
  throw new Error(`Invalid NODE_ENV ${environment}, must be one of: [development, test, production]`);
}

const dbDriver: Dialect = 'postgres';

console.log('Connecting to database ' + dbName + ' as user: ' + dbUser);

const sequelizeConnection = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: dbDriver
});

export default sequelizeConnection;