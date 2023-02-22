import dotenv from 'dotenv';
dotenv.config();

import { Sequelize, Dialect } from 'sequelize';

const dbHost: string = process.env.DATABASE_HOST || 'localhost';
const dbDriver: Dialect = 'postgres';
const dbName: string = process.env.DATABASE_NAME || 'skirmish_server_poc_development';
const dbUser: string = process.env.DATABASE_USER || 'postgres';
const dbPassword: string  = process.env.DATABASE_PASSWORD;

console.log('Connecting to database ' + dbName + ' as user: ' + dbUser);

const sequelizeConnection = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: dbDriver
});

export default sequelizeConnection;