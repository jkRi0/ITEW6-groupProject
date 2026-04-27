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

router.get('/academics/student/materials', requireAuth(), requireRole('student'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;

    const studentRows = await query(db, 'SELECT id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(studentRows) || studentRows.length === 0) return res.json({ items: [] });

    const studentId = studentRows[0].id;

    const rows = await query(
      db,
      `SELECT 
        c.id AS course_id,
        c.code AS course_code,
        c.title AS course_title,
        cm.syllabus,
        cm.curriculum,
        cm.academic_year,
        cm.term
      FROM enrollments e
      JOIN sections s ON s.id = e.section_id
      JOIN courses c ON c.id = s.course_id
      LEFT JOIN course_materials cm ON cm.course_id = c.id AND cm.academic_year = s.academic_year AND cm.term = s.term
      WHERE e.student_id = ?
      GROUP BY c.id, cm.id
      ORDER BY s.academic_year DESC, s.term DESC, c.code ASC`,
      [studentId]
    );

    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/academics/courses/:courseId/lessons', requireAuth(), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const courseId = req.params.courseId;

    const rows = await query(
      db,
      'SELECT id, title, content, order_index FROM lessons WHERE course_id = ? ORDER BY order_index ASC, id ASC',
      [courseId]
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

router.get('/academics/faculty/me', requireAuth(), requireRole('faculty'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(db, 'SELECT * FROM faculty WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ message: 'Faculty record not found' });
    }
    res.json({ item: rows[0] });
  } catch (err) {
    console.error('Faculty profile fetch error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

router.put('/academics/faculty/me', requireAuth(), requireRole('faculty'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const facultyRows = await query(db, 'SELECT id FROM faculty WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(facultyRows) || facultyRows.length === 0) {
      return res.status(404).json({ message: 'Faculty record not found' });
    }
    const facultyId = facultyRows[0].id;

    const {
      first_name, middle_name, last_name, gender,
      email, contact_number, expertise, educational_background
    } = req.body;

    await query(
      db,
      `UPDATE faculty SET 
        first_name = ?, middle_name = ?, last_name = ?, gender = ?,
        email = ?, contact_number = ?, expertise = ?, educational_background = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        first_name, middle_name, last_name, gender,
        email, contact_number, expertise, educational_background,
        facultyId
      ]
    );

    const updatedRows = await query(db, 'SELECT * FROM faculty WHERE id = ?', [facultyId]);
    res.json({ message: 'Profile updated', item: updatedRows[0] });
  } catch (err) {
    console.error('Faculty profile update error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/academics/faculty/profile', requireAuth(), requireRole('faculty'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(db, 'SELECT * FROM faculty WHERE user_id = ? LIMIT 1', [req.user.id]);
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/academics/faculty/sections', requireAuth(), requireRole('faculty'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const facultyRows = await query(db, 'SELECT id FROM faculty WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(facultyRows) || facultyRows.length === 0) return res.json({ items: [] });
    const facultyId = facultyRows[0].id;

    const rows = await query(
      db,
      `SELECT DISTINCT sec.id, sec.section_name, c.code AS course_code, c.title AS course_title, sec.academic_year, sec.term
       FROM sections sec
       JOIN courses c ON c.id = sec.course_id
       JOIN schedules s ON s.section_id = sec.id
       WHERE s.faculty_id = ?`,
      [facultyId]
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/academics/faculty/students', requireAuth(), requireRole('faculty'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const facultyRows = await query(db, 'SELECT id FROM faculty WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(facultyRows) || facultyRows.length === 0) return res.json({ items: [] });
    const facultyId = facultyRows[0].id;

    const rows = await query(
      db,
      `SELECT DISTINCT st.id, st.student_number, st.first_name, st.last_name, st.academic_status, sec.section_name
       FROM students st
       JOIN enrollments e ON e.student_id = st.id
       JOIN sections sec ON sec.id = e.section_id
       JOIN schedules s ON s.section_id = sec.id
       WHERE s.faculty_id = ?`,
      [facultyId]
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/academics/faculty/grades', requireAuth(), requireRole('faculty'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const facultyRows = await query(db, 'SELECT id FROM faculty WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(facultyRows) || facultyRows.length === 0) return res.json({ items: [] });
    const facultyId = facultyRows[0].id;

    const rows = await query(
      db,
      `SELECT scr.id, st.student_number, st.last_name, c.code AS course_code, scr.final_grade, scr.status, scr.academic_year, scr.term
       FROM student_course_records scr
       JOIN students st ON st.id = scr.student_id
       JOIN courses c ON c.id = scr.course_id
       JOIN sections sec ON sec.course_id = c.id
       JOIN schedules s ON s.section_id = sec.id
       WHERE s.faculty_id = ?`,
      [facultyId]
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/academics/faculty/materials', requireAuth(), requireRole('faculty'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const facultyRows = await query(db, 'SELECT id FROM faculty WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(facultyRows) || facultyRows.length === 0) return res.json({ items: [] });
    const facultyId = facultyRows[0].id;

    const rows = await query(
      db,
      `SELECT DISTINCT cm.id, c.code AS course_code, c.title AS course_title, cm.syllabus, cm.curriculum
       FROM course_materials cm
       JOIN courses c ON c.id = cm.course_id
       JOIN sections sec ON sec.course_id = c.id
       JOIN schedules s ON s.section_id = sec.id
       WHERE s.faculty_id = ?`,
      [facultyId]
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/academics/faculty/events', requireAuth(), requireRole('faculty'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(
      db,
      `SELECT e.id, e.title, e.event_date, e.location, (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) AS participant_count
       FROM events e
       ORDER BY e.event_date DESC`
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/academics/faculty/violations', requireAuth(), requireRole('faculty'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(
      db,
      `SELECT sv.id, st.student_number, st.last_name, sv.violation_type, sv.date_reported, sv.status
       FROM student_violations sv
       JOIN students st ON st.id = sv.student_id
       ORDER BY sv.date_reported DESC`
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/academics/faculty/affiliations', requireAuth(), requireRole('faculty'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const facultyRows = await query(db, 'SELECT id FROM faculty WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(facultyRows) || facultyRows.length === 0) return res.json({ items: [] });
    const facultyId = facultyRows[0].id;

    const achievements = await query(
      db,
      'SELECT id, title, issuer, date_awarded, level FROM faculty_achievements WHERE faculty_id = ?',
      [facultyId]
    );
    const leadership = await query(
      db,
      `SELECT fl.id, o.name AS organization_name, fl.designation, fl.academic_year 
       FROM faculty_leadership fl
       JOIN organizations o ON o.id = fl.organization_id
       WHERE fl.faculty_id = ?`,
      [facultyId]
    );

    res.json({ items: [...achievements, ...leadership] });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/admin/academic-records', requireAuth(), requireRole('admin'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(
      db,
      `SELECT scr.id, st.student_number, st.last_name, c.code AS course_code, scr.final_grade, scr.status, scr.academic_year, scr.term
       FROM student_course_records scr
       JOIN students st ON st.id = scr.student_id
       JOIN courses c ON c.id = scr.course_id
       ORDER BY scr.recorded_at DESC`
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/admin/non-academic', requireAuth(), requireRole('admin'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const achievements = await query(
      db,
      `SELECT 'Achievement' AS type, st.student_number, st.last_name, sa.title, sa.date_awarded AS date
       FROM student_achievements sa
       JOIN students st ON st.id = sa.student_id`
    );
    const sports = await query(
      db,
      `SELECT 'Sport' AS type, st.student_number, st.last_name, s.name AS title, ss.academic_year AS date
       FROM student_sports ss
       JOIN students st ON st.id = ss.student_id
       JOIN sports s ON s.id = ss.sport_id`
    );
    res.json({ items: [...achievements, ...sports] });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/admin/affiliations', requireAuth(), requireRole('admin'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(
      db,
      `SELECT sl.id, st.student_number, st.last_name, o.name AS organization_name, sl.designation, sl.academic_year
       FROM student_leadership sl
       JOIN students st ON st.id = sl.student_id
       JOIN organizations o ON o.id = sl.organization_id`
    );
    res.json({ items: rows });
  } catch (err) {
    console.error('Admin affiliations error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/admin/violations', requireAuth(), requireRole('admin'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(
      db,
      `SELECT sv.id, st.student_number, st.last_name, sv.violation_type, sv.date_reported, sv.status
       FROM student_violations sv
       JOIN students st ON st.id = sv.student_id
       ORDER BY sv.date_reported DESC`
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/admin/medical', requireAuth(), requireRole('admin'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(
      db,
      `SELECT smr.id, st.student_number, st.last_name, smr.condition_type, smr.last_updated_at
       FROM student_medical_records smr
       JOIN students st ON st.id = smr.student_id`
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/admin/documents', requireAuth(), requireRole('admin'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(
      db,
      `SELECT id, owner_type, owner_id, doc_type, file_url, created_at FROM documents`
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/admin/activity', requireAuth(), requireRole('admin'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(
      db,
      `SELECT al.id, u.full_name AS actor_name, al.action, al.entity, al.entity_id, al.created_at
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.actor_user_id
       ORDER BY al.created_at DESC`
    );
    res.json({ items: rows });
  } catch (err) {
    console.error('Admin activity error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
