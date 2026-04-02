const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};

const dbName = process.env.DB_NAME;

function connect(connection) {
  return new Promise((resolve, reject) => {
    connection.connect(err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function query(connection, sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

async function initDb() {
  const serverConn = mysql.createConnection(dbConfig);
  await connect(serverConn);
  await query(serverConn, `CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  serverConn.end();

  const db = mysql.createConnection({
    ...dbConfig,
    database: dbName
  });
  await connect(db);
  return db;
}

module.exports = {
  initDb,
  query
};
