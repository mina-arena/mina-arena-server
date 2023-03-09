if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

export default {
  development: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOST,
    dialect: 'postgres'
  },
  test: {
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME,
    host: process.env.TEST_DB_HOST,
    dialect: 'postgres'
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: 'postgres',
    ssl: true,
    dialectOptions: {
      ssl: true,
      rejectUnauthorized: false
    }
  }
};