const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDb, query } = require('./db');
const { initSchema } = require('./schemaInit');
const authRoutes = require('./routes/auth');
const academicsRoutes = require('./routes/academics');
const skillsRoutes = require('./routes/skills');
const adminRoutes = require('./routes/admin');
const managementRoutes = require('./routes/management');
const studentRoutes = require('./routes/student');
const notificationsRoutes = require('./routes/notifications');
const { seed } = require('./seed');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Middleware to ensure DB is connected
const checkDb = (req, res, next) => {
  if (!req.app.locals.db) return res.status(503).json({ message: 'Database connecting...' });
  next();
};

app.use(checkDb);
app.use('/api', authRoutes);
app.use('/api', academicsRoutes);
app.use('/api', skillsRoutes);
app.use('/api', adminRoutes);
app.use('/api', managementRoutes);
app.use('/api', studentRoutes);
app.use('/api', notificationsRoutes);

async function start() {
  try {
    const db = await initDb();
    app.locals.db = db;
    app.locals.query = query;

    await initSchema(db, query);
    await seed(db, query);

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
