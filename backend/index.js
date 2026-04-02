const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDb, query } = require('./db');
const { initSchema } = require('./schemaInit');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to ensure DB is connected
const checkDb = (req, res, next) => {
  if (!req.app.locals.db) return res.status(503).json({ message: 'Database connecting...' });
  next();
};

app.use(checkDb);
app.use('/api', authRoutes);

async function start() {
  try {
    const db = await initDb();
    app.locals.db = db;
    app.locals.query = query;

    await initSchema(db, query);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
}

start();
