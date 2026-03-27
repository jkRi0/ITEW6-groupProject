const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};

const dbName = process.env.DB_NAME;

const connection = mysql.createConnection(dbConfig);

connection.connect(err => {
  if (err) {
    console.error('Initial connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL server.');

  // Create database if not exists
  connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, (err) => {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }
    console.log(`Database "${dbName}" ensured.`);

    // Now connect to the specific database
    const db = mysql.createConnection({
      ...dbConfig,
      database: dbName
    });

    db.connect(err => {
      if (err) {
        console.error('Database connection failed:', err.stack);
        return;
      }
      console.log(`Connected to database "${dbName}".`);

      // Create users table if not exists
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          fullName VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('student', 'faculty') NOT NULL DEFAULT 'student',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      db.query(createTableQuery, (err) => {
        if (err) console.error('Error creating table:', err);
        else console.log('Users table ensured.');
      });

      // Export the db for use in routes
      global.db = db;
    });
  });
});

// Middleware to ensure DB is connected
const checkDb = (req, res, next) => {
  if (!global.db) return res.status(503).json({ message: 'Database connecting...' });
  next();
};

app.use(checkDb);

// Register Endpoint
app.post('/api/register', async (req, res) => {
  const { fullName, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (fullName, email, password, role) VALUES (?, ?, ?, ?)';
    global.db.query(query, [fullName, email, hashedPassword, role || 'student'], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email already exists' });
        }
        return res.status(500).json({ message: 'Database error' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';
  global.db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
