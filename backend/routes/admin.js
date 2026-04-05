const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/admin/overview', requireAuth(), requireRole('admin'), async (req, res) => {
  try {
    const query = req.app.locals.query;
    const db = req.app.locals.db;

    const [students, faculty, sections] = await Promise.all([
      query(db, 'SELECT COUNT(*) AS c FROM students'),
      query(db, 'SELECT COUNT(*) AS c FROM faculty'),
      query(db, 'SELECT COUNT(*) AS c FROM sections')
    ]);

    res.json({
      counts: {
        students: students?.[0]?.c || 0,
        faculty: faculty?.[0]?.c || 0,
        sections: sections?.[0]?.c || 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/admin/activity', requireAuth(), requireRole('admin'), async (req, res) => {
  try {
    const query = req.app.locals.query;
    const db = req.app.locals.db;

    const rows = await query(
      db,
      `SELECT al.id, al.action, al.entity, al.entity_id, al.created_at,
              u.full_name AS actor_name
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.actor_user_id
       ORDER BY al.created_at DESC
       LIMIT 10`
    );

    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/admin/students', requireAuth(), requireRole('admin'), async (req, res) => {
  try {
    const query = req.app.locals.query;
    const db = req.app.locals.db;

    const rows = await query(
      db,
      `SELECT s.id, s.student_number, s.first_name, s.last_name, s.academic_status, s.email,
              u.email AS user_email
       FROM students s
       LEFT JOIN users u ON u.id = s.user_id
       ORDER BY s.id DESC
       LIMIT 50`
    );

    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/admin/faculty', requireAuth(), requireRole('admin'), async (req, res) => {
  try {
    const query = req.app.locals.query;
    const db = req.app.locals.db;

    const rows = await query(
      db,
      `SELECT f.id, f.first_name, f.last_name, f.email, f.expertise,
              u.email AS user_email
       FROM faculty f
       LEFT JOIN users u ON u.id = f.user_id
       ORDER BY f.id DESC
       LIMIT 50`
    );

    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
