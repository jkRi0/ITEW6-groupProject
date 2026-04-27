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
      `SELECT ss.id, sk.name, ss.level, ss.evidence_url, ss.created_at, ss.skill_id
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

router.post('/skills/student', requireAuth(), requireRole('student'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const { name, level, evidence_url } = req.body;

    if (!name) return res.status(400).json({ message: 'Skill name is required' });

    const studentRows = await query(db, 'SELECT id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(studentRows) || studentRows.length === 0) return res.status(404).json({ message: 'Student record not found' });
    const studentId = studentRows[0].id;

    // 1. Ensure skill exists in global 'skills' table
    let skillId;
    const existingSkills = await query(db, 'SELECT id FROM skills WHERE name = ? LIMIT 1', [name]);
    if (existingSkills.length > 0) {
      skillId = existingSkills[0].id;
    } else {
      const insertRes = await query(db, 'INSERT INTO skills (name) VALUES (?)', [name]);
      skillId = insertRes.insertId;
    }

    // 2. Check if student already has this skill
    const existingStudentSkill = await query(db, 'SELECT id FROM student_skills WHERE student_id = ? AND skill_id = ?', [studentId, skillId]);
    if (existingStudentSkill.length > 0) {
      return res.status(400).json({ message: 'Skill already added to your profile' });
    }

    // 3. Link skill to student
    await query(
      db,
      'INSERT INTO student_skills (student_id, skill_id, level, evidence_url) VALUES (?, ?, ?, ?)',
      [studentId, skillId, level || null, evidence_url || null]
    );

    res.status(201).json({ message: 'Skill added' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.put('/skills/student/:id', requireAuth(), requireRole('student'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const id = req.params.id;
    const { level, evidence_url } = req.body;

    const studentRows = await query(db, 'SELECT id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    const studentId = studentRows[0].id;

    await query(
      db,
      'UPDATE student_skills SET level = ?, evidence_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND student_id = ?',
      [level || null, evidence_url || null, id, studentId]
    );

    res.json({ message: 'Skill updated' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.delete('/skills/student/:id', requireAuth(), requireRole('student'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const id = req.params.id;

    const studentRows = await query(db, 'SELECT id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    const studentId = studentRows[0].id;

    await query(db, 'DELETE FROM student_skills WHERE id = ? AND student_id = ?', [id, studentId]);

    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/skills/student/achievements', requireAuth(), requireRole('student'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const studentRows = await query(db, 'SELECT id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(studentRows) || studentRows.length === 0) return res.json({ items: [] });
    const studentId = studentRows[0].id;

    const rows = await query(
      db,
      `SELECT id, title, issuer, date_awarded, level, description 
       FROM student_achievements 
       WHERE student_id = ? 
       ORDER BY date_awarded DESC`,
      [studentId]
    );
    res.json({ items: rows });
  } catch (err) {
    console.error('Achievements error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/skills/student/sports', requireAuth(), requireRole('student'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const studentRows = await query(db, 'SELECT id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(studentRows) || studentRows.length === 0) return res.json({ items: [] });
    const studentId = studentRows[0].id;

    const rows = await query(
      db,
      `SELECT ss.id, s.name AS activity_name, ss.role, s.category AS team_name, ss.academic_year, ss.term_or_season, ss.participation_level
       FROM student_sports ss
       JOIN sports s ON s.id = ss.sport_id
       WHERE ss.student_id = ? 
       ORDER BY ss.academic_year DESC`,
      [studentId]
    );
    res.json({ items: rows });
  } catch (err) {
    console.error('Sports error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/skills/student/events', requireAuth(), requireRole('student'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const studentRows = await query(db, 'SELECT id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(studentRows) || studentRows.length === 0) return res.json({ items: [] });
    const studentId = studentRows[0].id;

    const rows = await query(
      db,
      `SELECT ep.id, e.title, 'Event' AS event_type, 'School' AS organizer, e.event_date, e.location AS venue, ep.role AS participation_role 
       FROM event_participants ep
       JOIN events e ON e.id = ep.event_id
       WHERE ep.student_id = ? 
       ORDER BY e.event_date DESC`,
      [studentId]
    );
    res.json({ items: rows });
  } catch (err) {
    console.error('Events error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/student/affiliations', requireAuth(), requireRole('student'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const studentRows = await query(db, 'SELECT id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(studentRows) || studentRows.length === 0) return res.json({ items: [] });
    const studentId = studentRows[0].id;

    const rows = await query(
      db,
      `SELECT sl.id, o.name AS organization_name, sl.designation AS position, sl.academic_year AS term_start, 'Present' AS term_end, 'Active' AS status, '' AS description
       FROM student_leadership sl
       JOIN organizations o ON o.id = sl.organization_id
       WHERE sl.student_id = ? 
       ORDER BY sl.date_assigned DESC`,
      [studentId]
    );
    res.json({ items: rows });
  } catch (err) {
    console.error('Affiliations error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
