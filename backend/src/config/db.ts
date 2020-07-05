import mysql from 'mysql2';
import bluebird from 'bluebird';

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 50,
  Promise: bluebird
});

export default db;
