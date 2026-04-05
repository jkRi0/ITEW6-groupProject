const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/academics/student/classes', requireAuth(), requireRole('student'), async (req, res) => {
  try {
    const query = req.app.locals.query;
    const db = req.app.locals.db;

    const studentRows = await query(db, 'SELECT id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(studentRows) || studentRows.length === 0) return res.json({ items: [] });

    const studentId = studentRows[0].id;

    const rows = await query(
      db,
      `SELECT 
        e.id AS enrollment_id,
        e.status,
        e.date_enrolled,
        s.id AS section_id,
        s.section_name,
        s.academic_year,
        s.term,
        c.id AS course_id,
        c.code AS course_code,
        c.title AS course_title,
        c.units,
        sch.days_of_week,
        sch.start_time,
        sch.end_time,
        sch.room,
        f.first_name AS faculty_first_name,
        f.last_name AS faculty_last_name
      FROM enrollments e
      JOIN sections s ON s.id = e.section_id
      JOIN courses c ON c.id = s.course_id
      LEFT JOIN schedules sch ON sch.section_id = s.id
      LEFT JOIN faculty f ON f.id = sch.faculty_id
      WHERE e.student_id = ?
      ORDER BY s.academic_year DESC, s.term DESC, c.code ASC`,
      [studentId]
    );

    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/academics/faculty/stats', requireAuth(), requireRole('faculty'), async (req, res) => {
  try {
    const query = req.app.locals.query;
    const db = req.app.locals.db;

    const facultyRows = await query(db, 'SELECT id FROM faculty WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(facultyRows) || facultyRows.length === 0) {
      return res.json({ counts: { sections: 0, students: 0 } });
    }

    const facultyId = facultyRows[0].id;

    const sectionCountRows = await query(
      db,
      'SELECT COUNT(DISTINCT section_id) AS c FROM schedules WHERE faculty_id = ?',
      [facultyId]
    );

    const studentCountRows = await query(
      db,
      `SELECT COUNT(DISTINCT e.student_id) AS c
       FROM schedules sch
       JOIN enrollments e ON e.section_id = sch.section_id
       WHERE sch.faculty_id = ?`,
      [facultyId]
    );

    res.json({
      counts: {
        sections: sectionCountRows?.[0]?.c || 0,
        students: studentCountRows?.[0]?.c || 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/academics/faculty/today', requireAuth(), requireRole('faculty'), async (req, res) => {
  try {
    const query = req.app.locals.query;
    const db = req.app.locals.db;

    const facultyRows = await query(db, 'SELECT id FROM faculty WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(facultyRows) || facultyRows.length === 0) return res.json({ items: [] });

    const facultyId = facultyRows[0].id;

    const rows = await query(
      db,
      `SELECT 
        sch.id AS schedule_id,
        sch.days_of_week,
        sch.start_time,
        sch.end_time,
        sch.room,
        sch.lab,
        s.section_name,
        s.academic_year,
        s.term,
        c.code AS course_code,
        c.title AS course_title
      FROM schedules sch
      JOIN sections s ON s.id = sch.section_id
      JOIN courses c ON c.id = s.course_id
      WHERE sch.faculty_id = ?
      ORDER BY sch.start_time ASC`,
      [facultyId]
    );

    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/academics/admin/overview', requireAuth(), requireRole('admin'), async (req, res) => {
  try {
    const query = req.app.locals.query;
    const db = req.app.locals.db;

    const [courses] = await Promise.all([
      query(db, 'SELECT COUNT(*) AS c FROM courses')
    ]);

    res.json({
      counts: {
        courses: courses?.[0]?.c || 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
