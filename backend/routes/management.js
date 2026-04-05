const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

function safeJson(v) {
  try {
    return v == null ? null : JSON.stringify(v);
  } catch (e) {
    return null;
  }
}

async function writeAuditLog({ db, query, actorUserId, action, entity, entityId, before, after }) {
  await query(
    db,
    'INSERT INTO audit_logs (actor_user_id, action, entity, entity_id, before_json, after_json) VALUES (?, ?, ?, ?, ?, ?)',
    [actorUserId || null, action, entity, entityId, safeJson(before), safeJson(after)]
  );
}

function requireBodyFields(fields) {
  return (req, res, next) => {
    for (const f of fields) {
      if (req.body[f] === undefined) {
        return res.status(400).json({ message: `Missing field: ${f}` });
      }
    }
    next();
  };
}

router.use('/admin', requireAuth(), requireRole('admin'));

// Users (admin user management)
router.get('/admin/users', async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(
      db,
      `SELECT id, full_name, email, role, is_disabled, disabled_at, created_at
       FROM users
       ORDER BY id DESC
       LIMIT 500`
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/admin/users', requireBodyFields(['full_name', 'email', 'password', 'role']), async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;
    const { db, query } = req.app.locals;

    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await query(
      db,
      'INSERT INTO users (full_name, email, password_hash, role, is_disabled, disabled_at) VALUES (?, ?, ?, ?, 0, NULL)',
      [full_name, email, passwordHash, role]
    );

    const rows = await query(db, 'SELECT id, full_name, email, role, is_disabled, disabled_at, created_at FROM users WHERE email = ? LIMIT 1', [email]);
    const created = rows[0];

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'CREATE', entity: 'users', entityId: created.id, before: null, after: created });

    res.status(201).json({ item: created });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Database error' });
  }
});

router.put('/admin/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT id, full_name, email, role, is_disabled, disabled_at, created_at FROM users WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    const full_name = req.body.full_name ?? before.full_name;
    const email = req.body.email ?? before.email;
    const role = req.body.role ?? before.role;

    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    await query(db, 'UPDATE users SET full_name = ?, email = ?, role = ? WHERE id = ?', [full_name, email, role, id]);
    const afterRows = await query(db, 'SELECT id, full_name, email, role, is_disabled, disabled_at, created_at FROM users WHERE id = ? LIMIT 1', [id]);
    const after = afterRows[0];

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'UPDATE', entity: 'users', entityId: id, before, after });

    res.json({ item: after });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/admin/users/:id/disable', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT id, full_name, email, role, is_disabled, disabled_at FROM users WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    await query(db, 'UPDATE users SET is_disabled = 1, disabled_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    const afterRows = await query(db, 'SELECT id, full_name, email, role, is_disabled, disabled_at FROM users WHERE id = ? LIMIT 1', [id]);
    const after = afterRows[0];

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'DISABLE', entity: 'users', entityId: id, before, after });
    res.json({ item: after });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/admin/users/:id/enable', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT id, full_name, email, role, is_disabled, disabled_at FROM users WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    await query(db, 'UPDATE users SET is_disabled = 0, disabled_at = NULL WHERE id = ?', [id]);
    const afterRows = await query(db, 'SELECT id, full_name, email, role, is_disabled, disabled_at FROM users WHERE id = ? LIMIT 1', [id]);
    const after = afterRows[0];

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'ENABLE', entity: 'users', entityId: id, before, after });
    res.json({ item: after });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/admin/users/:id/reset-password', requireBodyFields(['password']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { password } = req.body;
    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT id, email FROM users WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    const passwordHash = await bcrypt.hash(password, 10);
    await query(db, 'UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'RESET_PASSWORD', entity: 'users', entityId: id, before, after: null });
    res.json({ message: 'Password reset' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// Hard delete (use carefully)
router.delete('/admin/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT id, full_name, email, role, is_disabled, disabled_at FROM users WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    await query(db, 'DELETE FROM users WHERE id = ?', [id]);
    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'DELETE', entity: 'users', entityId: id, before, after: null });

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// Courses
router.get('/admin/courses', async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(db, 'SELECT id, code, title, units FROM courses ORDER BY code ASC');
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/admin/courses', requireBodyFields(['code', 'title']), async (req, res) => {
  try {
    const { code, title, units } = req.body;
    const { db, query } = req.app.locals;

    await query(db, 'INSERT INTO courses (code, title, units) VALUES (?, ?, ?)', [code, title, units ?? null]);
    const rows = await query(db, 'SELECT id, code, title, units FROM courses WHERE code = ? LIMIT 1', [code]);
    const created = rows[0];

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'CREATE', entity: 'courses', entityId: created.id, before: null, after: created });

    res.status(201).json({ item: created });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Course code already exists' });
    res.status(500).json({ message: 'Database error' });
  }
});

router.put('/admin/courses/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT id, code, title, units FROM courses WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });

    const before = beforeRows[0];
    const code = req.body.code ?? before.code;
    const title = req.body.title ?? before.title;
    const units = req.body.units ?? before.units;

    await query(db, 'UPDATE courses SET code = ?, title = ?, units = ? WHERE id = ?', [code, title, units ?? null, id]);
    const afterRows = await query(db, 'SELECT id, code, title, units FROM courses WHERE id = ? LIMIT 1', [id]);
    const after = afterRows[0];

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'UPDATE', entity: 'courses', entityId: id, before, after });

    res.json({ item: after });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Course code already exists' });
    res.status(500).json({ message: 'Database error' });
  }
});

router.delete('/admin/courses/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT id, code, title, units FROM courses WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    await query(db, 'DELETE FROM courses WHERE id = ?', [id]);
    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'DELETE', entity: 'courses', entityId: id, before, after: null });

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// Sections
router.get('/admin/sections', async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(
      db,
      `SELECT s.id, s.course_id, c.code AS course_code, s.section_name, s.academic_year, s.term
       FROM sections s
       JOIN courses c ON c.id = s.course_id
       ORDER BY s.academic_year DESC, s.term DESC, c.code ASC, s.section_name ASC`
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/admin/sections', requireBodyFields(['course_id', 'section_name', 'academic_year', 'term']), async (req, res) => {
  try {
    const { course_id, section_name, academic_year, term } = req.body;
    const { db, query } = req.app.locals;

    await query(db, 'INSERT INTO sections (course_id, section_name, academic_year, term) VALUES (?, ?, ?, ?)', [course_id, section_name, academic_year, term]);
    const rows = await query(db, 'SELECT id, course_id, section_name, academic_year, term FROM sections ORDER BY id DESC LIMIT 1');
    const created = rows[0];

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'CREATE', entity: 'sections', entityId: created.id, before: null, after: created });

    res.status(201).json({ item: created });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Section already exists for that course/year/term' });
    res.status(500).json({ message: 'Database error' });
  }
});

router.put('/admin/sections/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT id, course_id, section_name, academic_year, term FROM sections WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });

    const before = beforeRows[0];
    const course_id = req.body.course_id ?? before.course_id;
    const section_name = req.body.section_name ?? before.section_name;
    const academic_year = req.body.academic_year ?? before.academic_year;
    const term = req.body.term ?? before.term;

    await query(db, 'UPDATE sections SET course_id = ?, section_name = ?, academic_year = ?, term = ? WHERE id = ?', [course_id, section_name, academic_year, term, id]);
    const afterRows = await query(db, 'SELECT id, course_id, section_name, academic_year, term FROM sections WHERE id = ? LIMIT 1', [id]);
    const after = afterRows[0];

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'UPDATE', entity: 'sections', entityId: id, before, after });

    res.json({ item: after });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Section already exists for that course/year/term' });
    res.status(500).json({ message: 'Database error' });
  }
});

router.delete('/admin/sections/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT id, course_id, section_name, academic_year, term FROM sections WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    await query(db, 'DELETE FROM sections WHERE id = ?', [id]);
    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'DELETE', entity: 'sections', entityId: id, before, after: null });

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// Schedules
router.get('/admin/schedules', async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(
      db,
      `SELECT sch.id, sch.section_id, s.section_name, c.code AS course_code,
              sch.faculty_id, f.first_name, f.last_name,
              sch.room, sch.lab, sch.days_of_week, sch.start_time, sch.end_time
       FROM schedules sch
       JOIN sections s ON s.id = sch.section_id
       JOIN courses c ON c.id = s.course_id
       JOIN faculty f ON f.id = sch.faculty_id
       ORDER BY sch.id DESC`
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/admin/schedules', requireBodyFields(['section_id', 'faculty_id']), async (req, res) => {
  try {
    const { section_id, faculty_id, room, lab, days_of_week, start_time, end_time } = req.body;
    const { db, query } = req.app.locals;

    await query(
      db,
      'INSERT INTO schedules (section_id, faculty_id, room, lab, days_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [section_id, faculty_id, room ?? null, lab ?? null, days_of_week ?? null, start_time ?? null, end_time ?? null]
    );

    const rows = await query(db, 'SELECT * FROM schedules ORDER BY id DESC LIMIT 1');
    const created = rows[0];

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'CREATE', entity: 'schedules', entityId: created.id, before: null, after: created });

    res.status(201).json({ item: created });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.put('/admin/schedules/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT * FROM schedules WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    const section_id = req.body.section_id ?? before.section_id;
    const faculty_id = req.body.faculty_id ?? before.faculty_id;

    await query(
      db,
      'UPDATE schedules SET section_id = ?, faculty_id = ?, room = ?, lab = ?, days_of_week = ?, start_time = ?, end_time = ? WHERE id = ?',
      [
        section_id,
        faculty_id,
        req.body.room ?? before.room,
        req.body.lab ?? before.lab,
        req.body.days_of_week ?? before.days_of_week,
        req.body.start_time ?? before.start_time,
        req.body.end_time ?? before.end_time,
        id
      ]
    );

    const afterRows = await query(db, 'SELECT * FROM schedules WHERE id = ? LIMIT 1', [id]);
    const after = afterRows[0];

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'UPDATE', entity: 'schedules', entityId: id, before, after });

    res.json({ item: after });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.delete('/admin/schedules/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT * FROM schedules WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    await query(db, 'DELETE FROM schedules WHERE id = ?', [id]);
    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'DELETE', entity: 'schedules', entityId: id, before, after: null });

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// Enrollments
router.get('/admin/enrollments', async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(
      db,
      `SELECT e.id, e.student_id, st.student_number, st.first_name, st.last_name,
              e.section_id, s.section_name, c.code AS course_code,
              e.status, e.date_enrolled
       FROM enrollments e
       JOIN students st ON st.id = e.student_id
       JOIN sections s ON s.id = e.section_id
       JOIN courses c ON c.id = s.course_id
       ORDER BY e.id DESC`
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/admin/enrollments', requireBodyFields(['student_id', 'section_id']), async (req, res) => {
  try {
    const { student_id, section_id, status, date_enrolled } = req.body;
    const { db, query } = req.app.locals;

    await query(db, 'INSERT INTO enrollments (student_id, section_id, status, date_enrolled) VALUES (?, ?, ?, ?)', [student_id, section_id, status ?? null, date_enrolled ?? null]);
    const rows = await query(db, 'SELECT * FROM enrollments ORDER BY id DESC LIMIT 1');
    const created = rows[0];

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'CREATE', entity: 'enrollments', entityId: created.id, before: null, after: created });

    res.status(201).json({ item: created });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Enrollment already exists for that student/section' });
    res.status(500).json({ message: 'Database error' });
  }
});

router.put('/admin/enrollments/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT * FROM enrollments WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    await query(
      db,
      'UPDATE enrollments SET student_id = ?, section_id = ?, status = ?, date_enrolled = ? WHERE id = ?',
      [
        req.body.student_id ?? before.student_id,
        req.body.section_id ?? before.section_id,
        req.body.status ?? before.status,
        req.body.date_enrolled ?? before.date_enrolled,
        id
      ]
    );

    const afterRows = await query(db, 'SELECT * FROM enrollments WHERE id = ? LIMIT 1', [id]);
    const after = afterRows[0];

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'UPDATE', entity: 'enrollments', entityId: id, before, after });

    res.json({ item: after });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Enrollment already exists for that student/section' });
    res.status(500).json({ message: 'Database error' });
  }
});

router.delete('/admin/enrollments/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT * FROM enrollments WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    await query(db, 'DELETE FROM enrollments WHERE id = ?', [id]);
    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'DELETE', entity: 'enrollments', entityId: id, before, after: null });

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// Students
router.get('/admin/students', async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(
      db,
      `SELECT s.id, s.user_id, s.student_number, s.first_name, s.middle_name, s.last_name,
              s.gender, s.date_of_birth, s.email, s.contact_number,
              s.nationality, s.residency_status, s.present_address, s.permanent_address,
              s.emergency_contact_name, s.emergency_contact_relationship, s.emergency_contact_number,
              s.last_school_attended, s.academic_status
       FROM students s
       ORDER BY s.id DESC
       LIMIT 200`
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/admin/students', requireBodyFields(['student_number', 'first_name', 'last_name']), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const body = req.body;

    await query(
      db,
      `INSERT INTO students (
        user_id, student_number, first_name, middle_name, last_name, gender, date_of_birth,
        email, contact_number, nationality, residency_status, present_address, permanent_address,
        emergency_contact_name, emergency_contact_relationship, emergency_contact_number,
        last_school_attended, academic_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.user_id ?? null,
        body.student_number,
        body.first_name,
        body.middle_name ?? null,
        body.last_name,
        body.gender ?? null,
        body.date_of_birth ?? null,
        body.email ?? null,
        body.contact_number ?? null,
        body.nationality ?? null,
        body.residency_status ?? null,
        body.present_address ?? null,
        body.permanent_address ?? null,
        body.emergency_contact_name ?? null,
        body.emergency_contact_relationship ?? null,
        body.emergency_contact_number ?? null,
        body.last_school_attended ?? null,
        body.academic_status ?? null
      ]
    );

    const rows = await query(db, 'SELECT * FROM students ORDER BY id DESC LIMIT 1');
    const created = rows[0];
    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'CREATE', entity: 'students', entityId: created.id, before: null, after: created });

    res.status(201).json({ item: created });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Student number already exists' });
    res.status(500).json({ message: 'Database error' });
  }
});

router.put('/admin/students/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT * FROM students WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    const next = { ...before, ...req.body };

    await query(
      db,
      `UPDATE students SET
        user_id = ?, student_number = ?, first_name = ?, middle_name = ?, last_name = ?, gender = ?, date_of_birth = ?,
        email = ?, contact_number = ?, nationality = ?, residency_status = ?, present_address = ?, permanent_address = ?,
        emergency_contact_name = ?, emergency_contact_relationship = ?, emergency_contact_number = ?,
        last_school_attended = ?, academic_status = ?
      WHERE id = ?`,
      [
        next.user_id ?? null,
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
        id
      ]
    );

    const afterRows = await query(db, 'SELECT * FROM students WHERE id = ? LIMIT 1', [id]);
    const after = afterRows[0];
    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'UPDATE', entity: 'students', entityId: id, before, after });

    res.json({ item: after });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Student number already exists' });
    res.status(500).json({ message: 'Database error' });
  }
});

router.delete('/admin/students/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT * FROM students WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    await query(db, 'DELETE FROM students WHERE id = ?', [id]);
    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'DELETE', entity: 'students', entityId: id, before, after: null });

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// Faculty
router.get('/admin/faculty', async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(
      db,
      `SELECT f.id, f.user_id, f.first_name, f.middle_name, f.last_name, f.gender,
              f.email, f.contact_number, f.expertise, f.educational_background
       FROM faculty f
       ORDER BY f.id DESC
       LIMIT 200`
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/admin/faculty', requireBodyFields(['first_name', 'last_name', 'email']), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const body = req.body;

    await query(
      db,
      `INSERT INTO faculty (user_id, first_name, middle_name, last_name, gender, email, contact_number, expertise, educational_background)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.user_id ?? null,
        body.first_name,
        body.middle_name ?? null,
        body.last_name,
        body.gender ?? null,
        body.email,
        body.contact_number ?? null,
        body.expertise ?? null,
        body.educational_background ?? null
      ]
    );

    const rows = await query(db, 'SELECT * FROM faculty ORDER BY id DESC LIMIT 1');
    const created = rows[0];
    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'CREATE', entity: 'faculty', entityId: created.id, before: null, after: created });

    res.status(201).json({ item: created });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Faculty user/email already exists' });
    res.status(500).json({ message: 'Database error' });
  }
});

router.put('/admin/faculty/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT * FROM faculty WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    const next = { ...before, ...req.body };

    await query(
      db,
      `UPDATE faculty SET
        user_id = ?, first_name = ?, middle_name = ?, last_name = ?, gender = ?, email = ?, contact_number = ?, expertise = ?, educational_background = ?
       WHERE id = ?`,
      [
        next.user_id ?? null,
        next.first_name,
        next.middle_name ?? null,
        next.last_name,
        next.gender ?? null,
        next.email,
        next.contact_number ?? null,
        next.expertise ?? null,
        next.educational_background ?? null,
        id
      ]
    );

    const afterRows = await query(db, 'SELECT * FROM faculty WHERE id = ? LIMIT 1', [id]);
    const after = afterRows[0];
    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'UPDATE', entity: 'faculty', entityId: id, before, after });

    res.json({ item: after });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Faculty user/email already exists' });
    res.status(500).json({ message: 'Database error' });
  }
});

router.delete('/admin/faculty/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT * FROM faculty WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    await query(db, 'DELETE FROM faculty WHERE id = ?', [id]);
    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'DELETE', entity: 'faculty', entityId: id, before, after: null });

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// Skills
router.get('/admin/skills', async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(db, 'SELECT id, name FROM skills ORDER BY name ASC');
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/admin/skills', requireBodyFields(['name']), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    await query(db, 'INSERT INTO skills (name) VALUES (?)', [req.body.name]);
    const rows = await query(db, 'SELECT id, name FROM skills WHERE name = ? LIMIT 1', [req.body.name]);
    const created = rows[0];
    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'CREATE', entity: 'skills', entityId: created.id, before: null, after: created });
    res.status(201).json({ item: created });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Skill already exists' });
    res.status(500).json({ message: 'Database error' });
  }
});

router.put('/admin/skills/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT id, name FROM skills WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    const name = req.body.name ?? before.name;
    await query(db, 'UPDATE skills SET name = ? WHERE id = ?', [name, id]);

    const afterRows = await query(db, 'SELECT id, name FROM skills WHERE id = ? LIMIT 1', [id]);
    const after = afterRows[0];

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'UPDATE', entity: 'skills', entityId: id, before, after });

    res.json({ item: after });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Skill already exists' });
    res.status(500).json({ message: 'Database error' });
  }
});

router.delete('/admin/skills/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT id, name FROM skills WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    await query(db, 'DELETE FROM skills WHERE id = ?', [id]);
    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'DELETE', entity: 'skills', entityId: id, before, after: null });

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// Notifications
router.get('/admin/notifications', async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const rows = await query(
      db,
      `SELECT id, title, message, target_role, target_user_id, created_by_user_id, created_at
       FROM notifications
       ORDER BY created_at DESC
       LIMIT 200`
    );
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/admin/notifications', requireBodyFields(['title', 'message']), async (req, res) => {
  try {
    const { db, query } = req.app.locals;
    const { title, message, target_role, target_user_id } = req.body;

    await query(
      db,
      'INSERT INTO notifications (title, message, target_role, target_user_id, created_by_user_id) VALUES (?, ?, ?, ?, ?)',
      [title, message, target_role ?? null, target_user_id ?? null, req.user.id]
    );

    const rows = await query(db, 'SELECT * FROM notifications ORDER BY id DESC LIMIT 1');
    const created = rows[0];

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'CREATE', entity: 'notifications', entityId: created.id, before: null, after: created });

    res.status(201).json({ item: created });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.put('/admin/notifications/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT * FROM notifications WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    const next = { ...before, ...req.body };

    await query(
      db,
      'UPDATE notifications SET title = ?, message = ?, target_role = ?, target_user_id = ? WHERE id = ?',
      [next.title, next.message, next.target_role ?? null, next.target_user_id ?? null, id]
    );

    const afterRows = await query(db, 'SELECT * FROM notifications WHERE id = ? LIMIT 1', [id]);
    const after = afterRows[0];

    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'UPDATE', entity: 'notifications', entityId: id, before, after });

    res.json({ item: after });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.delete('/admin/notifications/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const { db, query } = req.app.locals;
    const beforeRows = await query(db, 'SELECT * FROM notifications WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(beforeRows) || beforeRows.length === 0) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    await query(db, 'DELETE FROM notifications WHERE id = ?', [id]);
    await writeAuditLog({ db, query, actorUserId: req.user.id, action: 'DELETE', entity: 'notifications', entityId: id, before, after: null });

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
