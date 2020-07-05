import mysql from 'mysql2';
import bluebird from 'bluebird';

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'my-secret-pw',
  database: 'employees',
  connectionLimit: 50,
  Promise: bluebird
});

export default db;
