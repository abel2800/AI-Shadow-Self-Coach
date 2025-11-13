const { Sequelize } = require('sequelize');
const { config } = require('./environment');

const dbConfig = config.database;

const sequelize = new Sequelize(
  dbConfig.name,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: config.database.logging !== undefined 
      ? config.database.logging 
      : (process.env.NODE_ENV === 'development' ? console.log : false),
    pool: dbConfig.pool,
    ssl: dbConfig.ssl ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
);

module.exports = { sequelize, Sequelize };

