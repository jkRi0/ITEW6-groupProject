const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/skills/student/summary', requireAuth(), requireRole('student'), async (req, res) => {
  try {
    const query = req.app.locals.query;
    const db = req.app.locals.db;

    const studentRows = await query(db, 'SELECT id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(studentRows) || studentRows.length === 0) {
      return res.json({ counts: { skills: 0, achievements: 0 } });
    }

    const studentId = studentRows[0].id;

    const [skillsCountRows, achievementsCountRows] = await Promise.all([
      query(db, 'SELECT COUNT(*) AS c FROM student_skills WHERE student_id = ?', [studentId]),
      query(db, 'SELECT COUNT(*) AS c FROM student_achievements WHERE student_id = ?', [studentId])
    ]);

    res.json({
      counts: {
        skills: skillsCountRows?.[0]?.c || 0,
        achievements: achievementsCountRows?.[0]?.c || 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/skills/student/list', requireAuth(), requireRole('student'), async (req, res) => {
  try {
    const query = req.app.locals.query;
    const db = req.app.locals.db;

    const studentRows = await query(db, 'SELECT id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(studentRows) || studentRows.length === 0) return res.json({ items: [] });

    const studentId = studentRows[0].id;

    const rows = await query(
      db,
      `SELECT ss.id, sk.name, ss.level, ss.evidence_url, ss.created_at
       FROM student_skills ss
       JOIN skills sk ON sk.id = ss.skill_id
       WHERE ss.student_id = ?
       ORDER BY ss.created_at DESC`,
      [studentId]
    );

    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/achievements/student/list', requireAuth(), requireRole('student'), async (req, res) => {
  try {
    const query = req.app.locals.query;
    const db = req.app.locals.db;

    const studentRows = await query(db, 'SELECT id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(studentRows) || studentRows.length === 0) return res.json({ items: [] });

    const studentId = studentRows[0].id;

    const rows = await query(
      db,
      `SELECT id, title, issuer, date_awarded, level, description
       FROM student_achievements
       WHERE student_id = ?
       ORDER BY date_awarded DESC, id DESC`,
      [studentId]
    );

    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
