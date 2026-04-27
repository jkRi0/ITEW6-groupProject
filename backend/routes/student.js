const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/student/me', requireAuth(), requireRole('student'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;

    const rows = await query(
      db,
      `SELECT
        s.id,
        s.user_id,
        s.student_number,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.gender,
        s.date_of_birth,
        s.email,
        s.contact_number,
        s.nationality,
        s.residency_status,
        s.present_address,
        s.permanent_address,
        s.emergency_contact_name,
        s.emergency_contact_relationship,
        s.emergency_contact_number,
        s.last_school_attended,
        s.academic_status,
        s.created_at,
        s.updated_at
      FROM students s
      WHERE s.user_id = ?
      LIMIT 1`,
      [req.user.id]
    );

    const item = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    res.json({ item });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/student/academic-records', requireAuth(), requireRole('student'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;

    const studentRows = await query(db, 'SELECT id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(studentRows) || studentRows.length === 0) {
      return res.json({ items: [] });
    }
    const studentId = studentRows[0].id;

    const rows = await query(
      db,
      `SELECT 
        scr.id,
        scr.academic_year,
        scr.term,
        scr.status,
        scr.final_grade,
        c.code AS course_code,
        c.title AS course_title,
        c.units
      FROM student_course_records scr
      JOIN courses c ON c.id = scr.course_id
      WHERE scr.student_id = ?
      ORDER BY scr.academic_year DESC, scr.term DESC, c.code ASC`,
      [studentId]
    );

    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.put('/student/me', requireAuth(), requireRole('student'), async (req, res) => {
  try {
    const { db, query } = req.app.locals;

    const existingRows = await query(db, 'SELECT * FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    if (!Array.isArray(existingRows) || existingRows.length === 0) {
      return res.status(404).json({ message: 'Student record not found' });
    }

    const existing = existingRows[0];
    const next = { ...existing, ...req.body };

    await query(
      db,
      `UPDATE students SET
        student_number = ?,
        first_name = ?,
        middle_name = ?,
        last_name = ?,
        gender = ?,
        date_of_birth = ?,
        email = ?,
        contact_number = ?,
        nationality = ?,
        residency_status = ?,
        present_address = ?,
        permanent_address = ?,
        emergency_contact_name = ?,
        emergency_contact_relationship = ?,
        emergency_contact_number = ?,
        last_school_attended = ?,
        academic_status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?`,
      [
        next.student_number,
        next.first_name,
        next.middle_name ?? null,
        next.last_name,
        next.gender ?? null,
        next.date_of_birth ?? null,
        next.email ?? null,
        next.contact_number ?? null,
        next.nationality ?? null,
        next.residency_status ?? null,
        next.present_address ?? null,
        next.permanent_address ?? null,
        next.emergency_contact_name ?? null,
        next.emergency_contact_relationship ?? null,
        next.emergency_contact_number ?? null,
        next.last_school_attended ?? null,
        next.academic_status ?? null,
        req.user.id
      ]
    );

    const rows = await query(
      db,
      'SELECT id, user_id, student_number, first_name, middle_name, last_name, gender, date_of_birth, email, contact_number, nationality, residency_status, present_address, permanent_address, emergency_contact_name, emergency_contact_relationship, emergency_contact_number, last_school_attended, academic_status, created_at, updated_at FROM students WHERE user_id = ? LIMIT 1',
      [req.user.id]
    );

    res.json({ item: rows[0] });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Student number already exists' });
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
