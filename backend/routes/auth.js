const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = req.app.locals.query;
    const db = req.app.locals.db;

    const sql = 'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)';
    await query(db, sql, [fullName, email, hashedPassword, role || 'student']);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = req.app.locals.query;
    const db = req.app.locals.db;

    const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    const results = await query(db, sql, [email]);

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
