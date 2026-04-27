const bcrypt = require('bcryptjs');

async function ensureUser(db, query, { fullName, email, password, role }) {
  const existing = await query(db, 'SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (Array.isArray(existing) && existing.length > 0) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await query(
    db,
    'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [fullName, email, passwordHash, role]
  );
}

async function getUserIdByEmail(db, query, email) {
  const rows = await query(db, 'SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows[0].id;
}

async function ensureStudentProfile(db, query, student) {
  const existing = await query(
    db,
    'SELECT id FROM students WHERE student_number = ? LIMIT 1',
    [student.student_number]
  );
  if (Array.isArray(existing) && existing.length > 0) return existing[0].id;

  await query(
    db,
    `INSERT INTO students (
      user_id, student_number, first_name, middle_name, last_name, gender, date_of_birth,
      email, contact_number, nationality, residency_status, present_address, permanent_address,
      emergency_contact_name, emergency_contact_relationship, emergency_contact_number,
      last_school_attended, academic_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      student.user_id || null,
      student.student_number,
      student.first_name,
      student.middle_name || null,
      student.last_name,
      student.gender || null,
      student.date_of_birth || null,
      student.email || null,
      student.contact_number || null,
      student.nationality || null,
      student.residency_status || null,
      student.present_address || null,
      student.permanent_address || null,
      student.emergency_contact_name || null,
      student.emergency_contact_relationship || null,
      student.emergency_contact_number || null,
      student.last_school_attended || null,
      student.academic_status || null
    ]
  );

  const inserted = await query(db, 'SELECT id FROM students WHERE student_number = ? LIMIT 1', [student.student_number]);
  return inserted[0].id;
}

async function ensureFacultyProfile(db, query, faculty) {
  const existing = await query(
    db,
    'SELECT id FROM faculty WHERE email = ? LIMIT 1',
    [faculty.email]
  );
  if (Array.isArray(existing) && existing.length > 0) return existing[0].id;

  await query(
    db,
    `INSERT INTO faculty (
      user_id, first_name, middle_name, last_name, gender, email, contact_number, expertise, educational_background
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      faculty.user_id || null,
      faculty.first_name,
      faculty.middle_name || null,
      faculty.last_name,
      faculty.gender || null,
      faculty.email,
      faculty.contact_number || null,
      faculty.expertise || null,
      faculty.educational_background || null
    ]
  );

  const inserted = await query(db, 'SELECT id FROM faculty WHERE email = ? LIMIT 1', [faculty.email]);
  return inserted[0].id;
}

async function ensureCourse(db, query, course) {
  const existing = await query(db, 'SELECT id FROM courses WHERE code = ? LIMIT 1', [course.code]);
  if (Array.isArray(existing) && existing.length > 0) return existing[0].id;
  await query(db, 'INSERT INTO courses (code, title, units) VALUES (?, ?, ?)', [course.code, course.title, course.units || null]);
  const inserted = await query(db, 'SELECT id FROM courses WHERE code = ? LIMIT 1', [course.code]);
  return inserted[0].id;
}

async function ensureSection(db, query, section) {
  const existing = await query(
    db,
    'SELECT id FROM sections WHERE course_id = ? AND section_name = ? AND academic_year = ? AND term = ? LIMIT 1',
    [section.course_id, section.section_name, section.academic_year, section.term]
  );
  if (Array.isArray(existing) && existing.length > 0) return existing[0].id;

  await query(
    db,
    'INSERT INTO sections (course_id, section_name, academic_year, term) VALUES (?, ?, ?, ?)',
    [section.course_id, section.section_name, section.academic_year, section.term]
  );
  const inserted = await query(
    db,
    'SELECT id FROM sections WHERE course_id = ? AND section_name = ? AND academic_year = ? AND term = ? LIMIT 1',
    [section.course_id, section.section_name, section.academic_year, section.term]
  );
  return inserted[0].id;
}

async function ensureSchedule(db, query, schedule) {
  const existing = await query(
    db,
    'SELECT id FROM schedules WHERE section_id = ? AND faculty_id = ? AND start_time <=> ? AND end_time <=> ? LIMIT 1',
    [schedule.section_id, schedule.faculty_id, schedule.start_time || null, schedule.end_time || null]
  );
  if (Array.isArray(existing) && existing.length > 0) return existing[0].id;

  await query(
    db,
    `INSERT INTO schedules (section_id, faculty_id, room, lab, days_of_week, start_time, end_time)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      schedule.section_id,
      schedule.faculty_id,
      schedule.room || null,
      schedule.lab || null,
      schedule.days_of_week || null,
      schedule.start_time || null,
      schedule.end_time || null
    ]
  );
  const inserted = await query(
    db,
    'SELECT id FROM schedules WHERE section_id = ? AND faculty_id = ? ORDER BY id DESC LIMIT 1',
    [schedule.section_id, schedule.faculty_id]
  );
  return inserted[0].id;
}

async function ensureEnrollment(db, query, enrollment) {
  const existing = await query(
    db,
    'SELECT id FROM enrollments WHERE student_id = ? AND section_id = ? LIMIT 1',
    [enrollment.student_id, enrollment.section_id]
  );
  if (Array.isArray(existing) && existing.length > 0) return existing[0].id;

  await query(
    db,
    'INSERT INTO enrollments (student_id, section_id, status, date_enrolled) VALUES (?, ?, ?, ?)',
    [enrollment.student_id, enrollment.section_id, enrollment.status || null, enrollment.date_enrolled || null]
  );
  const inserted = await query(
    db,
    'SELECT id FROM enrollments WHERE student_id = ? AND section_id = ? LIMIT 1',
    [enrollment.student_id, enrollment.section_id]
  );
  return inserted[0].id;
}

async function ensureSkill(db, query, name) {
  const existing = await query(db, 'SELECT id FROM skills WHERE name = ? LIMIT 1', [name]);
  if (Array.isArray(existing) && existing.length > 0) return existing[0].id;
  await query(db, 'INSERT INTO skills (name) VALUES (?)', [name]);
  const inserted = await query(db, 'SELECT id FROM skills WHERE name = ? LIMIT 1', [name]);
  return inserted[0].id;
}

async function ensureStudentSkill(db, query, studentSkill) {
  const existing = await query(
    db,
    'SELECT id FROM student_skills WHERE student_id = ? AND skill_id = ? LIMIT 1',
    [studentSkill.student_id, studentSkill.skill_id]
  );
  if (Array.isArray(existing) && existing.length > 0) return existing[0].id;

  await query(
    db,
    'INSERT INTO student_skills (student_id, skill_id, level, evidence_url) VALUES (?, ?, ?, ?)',
    [studentSkill.student_id, studentSkill.skill_id, studentSkill.level || null, studentSkill.evidence_url || null]
  );
  const inserted = await query(
    db,
    'SELECT id FROM student_skills WHERE student_id = ? AND skill_id = ? LIMIT 1',
    [studentSkill.student_id, studentSkill.skill_id]
  );
  return inserted[0].id;
}

async function ensureStudentAchievement(db, query, achievement) {
  const existing = await query(
    db,
    'SELECT id FROM student_achievements WHERE student_id = ? AND title = ? LIMIT 1',
    [achievement.student_id, achievement.title]
  );
  if (Array.isArray(existing) && existing.length > 0) return existing[0].id;

  await query(
    db,
    'INSERT INTO student_achievements (student_id, title, issuer, date_awarded, level, description) VALUES (?, ?, ?, ?, ?, ?)',
    [
      achievement.student_id,
      achievement.title,
      achievement.issuer || null,
      achievement.date_awarded || null,
      achievement.level || null,
      achievement.description || null
    ]
  );
  const inserted = await query(
    db,
    'SELECT id FROM student_achievements WHERE student_id = ? AND title = ? LIMIT 1',
    [achievement.student_id, achievement.title]
  );
  return inserted[0].id;
}

async function ensureAuditLog(db, query, log) {
  const existing = await query(
    db,
    'SELECT id FROM audit_logs WHERE action = ? AND entity = ? AND entity_id = ? LIMIT 1',
    [log.action, log.entity, log.entity_id]
  );
  if (Array.isArray(existing) && existing.length > 0) return existing[0].id;

  await query(
    db,
    'INSERT INTO audit_logs (actor_user_id, action, entity, entity_id, before_json, after_json) VALUES (?, ?, ?, ?, ?, ?)',
    [log.actor_user_id || null, log.action, log.entity, log.entity_id, log.before_json || null, log.after_json || null]
  );
  const inserted = await query(
    db,
    'SELECT id FROM audit_logs WHERE action = ? AND entity = ? AND entity_id = ? LIMIT 1',
    [log.action, log.entity, log.entity_id]
  );
  return inserted[0].id;
}

async function ensureCourseMaterial(db, query, cm) {
  const existing = await query(
    db,
    'SELECT id FROM course_materials WHERE course_id = ? AND academic_year = ? AND term = ? LIMIT 1',
    [cm.course_id, cm.academic_year, cm.term]
  );
  if (Array.isArray(existing) && existing.length > 0) return existing[0].id;

  await query(
    db,
    'INSERT INTO course_materials (course_id, academic_year, term, syllabus, curriculum) VALUES (?, ?, ?, ?, ?)',
    [cm.course_id, cm.academic_year, cm.term, cm.syllabus || null, cm.curriculum || null]
  );
  const inserted = await query(
    db,
    'SELECT id FROM course_materials WHERE course_id = ? AND academic_year = ? AND term = ? LIMIT 1',
    [cm.course_id, cm.academic_year, cm.term]
  );
  return inserted[0].id;
}

async function ensureLesson(db, query, lesson) {
  const existing = await query(
    db,
    'SELECT id FROM lessons WHERE course_id = ? AND title = ? LIMIT 1',
    [lesson.course_id, lesson.title]
  );
  if (Array.isArray(existing) && existing.length > 0) return existing[0].id;

  await query(
    db,
    'INSERT INTO lessons (course_id, title, content, order_index) VALUES (?, ?, ?, ?)',
    [lesson.course_id, lesson.title, lesson.content || null, lesson.order_index || null]
  );
  const inserted = await query(
    db,
    'SELECT id FROM lessons WHERE course_id = ? AND title = ? LIMIT 1',
    [lesson.course_id, lesson.title]
  );
  return inserted[0].id;
}

async function ensureNotification(db, query, n) {
  const existing = await query(
    db,
    'SELECT id FROM notifications WHERE title = ? AND target_role <=> ? AND target_user_id <=> ? LIMIT 1',
    [n.title, n.target_role || null, n.target_user_id || null]
  );
  if (Array.isArray(existing) && existing.length > 0) return existing[0].id;

  await query(
    db,
    'INSERT INTO notifications (title, message, target_role, target_user_id, created_by_user_id) VALUES (?, ?, ?, ?, ?)',
    [n.title, n.message, n.target_role || null, n.target_user_id || null, n.created_by_user_id || null]
  );
  const inserted = await query(
    db,
    'SELECT id FROM notifications WHERE title = ? ORDER BY id DESC LIMIT 1',
    [n.title]
  );
  return inserted[0].id;
}

async function seed(db, query) {
  await ensureUser(db, query, {
    fullName: 'Student Sample',
    email: 'student@asd.com',
    password: '123',
    role: 'student'
  });

  await ensureUser(db, query, {
    fullName: 'Faculty Sample',
    email: 'faculty@asd.com',
    password: '123',
    role: 'faculty'
  });

  await ensureUser(db, query, {
    fullName: 'Admin Sample',
    email: 'admin@asd.com',
    password: '123',
    role: 'admin'
  });

  const studentUserId = await getUserIdByEmail(db, query, 'student@asd.com');
  const facultyUserId = await getUserIdByEmail(db, query, 'faculty@asd.com');
  const adminUserId = await getUserIdByEmail(db, query, 'admin@asd.com');

  const studentIds = [];
  const studentProfiles = [
    {
      user_id: studentUserId,
      student_number: '2024-0001',
      first_name: 'Student',
      last_name: 'Sample',
      email: 'student@asd.com',
      academic_status: 'Regular',
      nationality: 'Filipino',
      present_address: 'City Proper',
      emergency_contact_name: 'Sample Guardian',
      emergency_contact_relationship: 'Parent',
      emergency_contact_number: '09171234567'
    },
    { student_number: '2024-0002', first_name: 'Aira', last_name: 'Reyes', gender: 'Female', academic_status: 'Regular', email: 'aira.reyes@example.com' },
    { student_number: '2024-0003', first_name: 'Ben', last_name: 'Cruz', gender: 'Male', academic_status: 'Probation', email: 'ben.cruz@example.com' },
    { student_number: '2024-0004', first_name: 'Carla', last_name: 'Santos', gender: 'Female', academic_status: 'Regular', email: 'carla.santos@example.com' },
    { student_number: '2024-0005', first_name: 'Diego', last_name: 'Lopez', gender: 'Male', academic_status: 'Regular', email: 'diego.lopez@example.com' }
  ];

  for (const s of studentProfiles) {
    const id = await ensureStudentProfile(db, query, s);
    studentIds.push(id);
  }

  const facultyIds = [];
  const facultyProfiles = [
    {
      user_id: facultyUserId,
      first_name: 'Faculty',
      last_name: 'Sample',
      email: 'faculty@asd.com',
      expertise: 'Software Engineering'
    },
    { first_name: 'Maria', last_name: 'Dela Cruz', email: 'maria.delacruz@example.com', expertise: 'Databases' },
    { first_name: 'Jose', last_name: 'Garcia', email: 'jose.garcia@example.com', expertise: 'Networks' },
    { first_name: 'Lina', last_name: 'Torres', email: 'lina.torres@example.com', expertise: 'Web Development' },
    { first_name: 'Paolo', last_name: 'Ramos', email: 'paolo.ramos@example.com', expertise: 'AI / ML' }
  ];

  for (const f of facultyProfiles) {
    const id = await ensureFacultyProfile(db, query, f);
    facultyIds.push(id);
  }

  const courseIds = [];
  const courses = [
    { code: 'CCS101', title: 'Intro to Computing', units: 3 },
    { code: 'CCS102', title: 'Programming 1', units: 3 },
    { code: 'CCS201', title: 'Data Structures', units: 3 },
    { code: 'CCS202', title: 'Database Systems', units: 3 },
    { code: 'CCS301', title: 'Software Engineering', units: 3 }
  ];
  for (const c of courses) courseIds.push(await ensureCourse(db, query, c));

  const sectionIds = [];
  const sections = [
    { course_id: courseIds[0], section_name: 'BSIT-1A', academic_year: '2024-2025', term: '1' },
    { course_id: courseIds[1], section_name: 'BSIT-1A', academic_year: '2024-2025', term: '1' },
    { course_id: courseIds[2], section_name: 'BSIT-2A', academic_year: '2024-2025', term: '1' },
    { course_id: courseIds[3], section_name: 'BSIT-2A', academic_year: '2024-2025', term: '1' },
    { course_id: courseIds[4], section_name: 'BSIT-3A', academic_year: '2024-2025', term: '1' }
  ];
  for (const s of sections) sectionIds.push(await ensureSection(db, query, s));

  const schedules = [
    { section_id: sectionIds[0], faculty_id: facultyIds[0], room: 'Room 204', days_of_week: 'MWF', start_time: '09:00:00', end_time: '10:00:00' },
    { section_id: sectionIds[1], faculty_id: facultyIds[0], lab: 'Lab 3', days_of_week: 'TTH', start_time: '13:00:00', end_time: '14:30:00' },
    { section_id: sectionIds[2], faculty_id: facultyIds[1], room: 'Room 301', days_of_week: 'MWF', start_time: '10:30:00', end_time: '11:30:00' },
    { section_id: sectionIds[3], faculty_id: facultyIds[2], room: 'Room 110', days_of_week: 'TTH', start_time: '09:00:00', end_time: '10:30:00' },
    { section_id: sectionIds[4], faculty_id: facultyIds[3], room: 'Room 220', days_of_week: 'SAT', start_time: '08:00:00', end_time: '11:00:00' }
  ];
  for (const sch of schedules) await ensureSchedule(db, query, sch);

  const enrollmentCombos = [
    { student_id: studentIds[0], section_id: sectionIds[0], status: 'enrolled', date_enrolled: '2024-08-15' },
    { student_id: studentIds[0], section_id: sectionIds[1], status: 'enrolled', date_enrolled: '2024-08-15' },
    { student_id: studentIds[1], section_id: sectionIds[0], status: 'enrolled', date_enrolled: '2024-08-15' },
    { student_id: studentIds[2], section_id: sectionIds[2], status: 'enrolled', date_enrolled: '2024-08-15' },
    { student_id: studentIds[3], section_id: sectionIds[3], status: 'enrolled', date_enrolled: '2024-08-15' }
  ];
  for (const e of enrollmentCombos) await ensureEnrollment(db, query, e);

  const skillNames = ['JavaScript', 'SQL', 'Problem Solving', 'Communication', 'Teamwork'];
  const skillIds = [];
  for (const name of skillNames) skillIds.push(await ensureSkill(db, query, name));

  const studentSkillSamples = [
    { student_id: studentIds[0], skill_id: skillIds[0], level: 'Intermediate', evidence_url: 'https://example.com/evidence/js' },
    { student_id: studentIds[0], skill_id: skillIds[1], level: 'Beginner', evidence_url: 'https://example.com/evidence/sql' },
    { student_id: studentIds[0], skill_id: skillIds[2], level: 'Intermediate', evidence_url: null },
    { student_id: studentIds[0], skill_id: skillIds[3], level: 'Intermediate', evidence_url: null },
    { student_id: studentIds[0], skill_id: skillIds[4], level: 'Advanced', evidence_url: null }
  ];
  for (const ss of studentSkillSamples) await ensureStudentSkill(db, query, ss);

  const achievementSamples = [
    { student_id: studentIds[0], title: 'Dean\'s List', issuer: 'CCS', date_awarded: '2024-12-20', level: 'College', description: 'Awarded for high academic performance.' },
    { student_id: studentIds[0], title: 'Hackathon Participation', issuer: 'Tech Org', date_awarded: '2024-10-05', level: 'Department', description: 'Participated in a 24h hackathon.' },
    { student_id: studentIds[0], title: 'Perfect Attendance', issuer: 'Instructor', date_awarded: '2024-11-15', level: 'Class', description: 'No absences during the term.' },
    { student_id: studentIds[0], title: 'Volunteer Service', issuer: 'Student Affairs', date_awarded: '2024-09-10', level: 'University', description: 'Helped in university event operations.' },
    { student_id: studentIds[0], title: 'Best Project', issuer: 'CCS', date_awarded: '2024-12-01', level: 'Department', description: 'Best project in Programming 1.' }
  ];
  for (const a of achievementSamples) await ensureStudentAchievement(db, query, a);

  const auditLogs = [
    { actor_user_id: adminUserId, action: 'SEED', entity: 'courses', entity_id: courseIds[0] },
    { actor_user_id: adminUserId, action: 'SEED', entity: 'courses', entity_id: courseIds[1] },
    { actor_user_id: adminUserId, action: 'SEED', entity: 'sections', entity_id: sectionIds[0] },
    { actor_user_id: adminUserId, action: 'SEED', entity: 'students', entity_id: studentIds[0] },
    { actor_user_id: adminUserId, action: 'SEED', entity: 'faculty', entity_id: facultyIds[0] }
  ];
  for (const l of auditLogs) await ensureAuditLog(db, query, l);

  const notifications = [
    { title: 'Welcome to CPS', message: 'Your account is ready. Explore your dashboard.', target_role: 'student', created_by_user_id: adminUserId },
    { title: 'Complete your profile', message: 'Please update your profile details and documents.', target_role: 'student', created_by_user_id: adminUserId },
    { title: 'Grade encoding reminder', message: 'Please encode grades before the deadline.', target_role: 'faculty', created_by_user_id: adminUserId },
    { title: 'System maintenance', message: 'Maintenance window this weekend.', target_role: null, created_by_user_id: adminUserId },
    { title: 'Admin notice', message: 'Review new registrations and audit logs.', target_role: 'admin', created_by_user_id: adminUserId }
  ];
  for (const n of notifications) await ensureNotification(db, query, n);

  const materials = [
    {
      course_id: courseIds[0],
      academic_year: '2024-2025',
      term: '1',
      syllabus: 'Intro to Computing Syllabus\n\n1. Basic Computer Concepts\n2. Hardware and Software\n3. Operating Systems\n4. Networking Basics',
      curriculum: 'Course Curriculum: 15 weeks total. 3 hours per week.'
    },
    {
      course_id: courseIds[1],
      academic_year: '2024-2025',
      term: '1',
      syllabus: 'Programming 1 Syllabus\n\n1. Logic Formulation\n2. Basic Syntax\n3. Control Structures\n4. Loops and Arrays',
      curriculum: 'Prerequisite for Programming 2. Hands-on coding in C++.'
    }
  ];
  for (const m of materials) await ensureCourseMaterial(db, query, m);

  const lessons = [
    { course_id: courseIds[0], title: 'History of Computers', content: 'Early computing devices: Abacus, ENIAC, etc.', order_index: 1 },
    { course_id: courseIds[0], title: 'Data Representation', content: 'Binary, Octal, Hexadecimal number systems.', order_index: 2 },
    { course_id: courseIds[1], title: 'Getting Started with C++', content: 'Hello World and basic syntax.', order_index: 1 },
    { course_id: courseIds[1], title: 'Variables and Data Types', content: 'Integers, floats, chars, and booleans.', order_index: 2 },
    { course_id: courseIds[1], title: 'Control Statements', content: 'If-else and Switch cases.', order_index: 3 }
  ];
  for (const l of lessons) await ensureLesson(db, query, l);
}

module.exports = {
  seed
};
