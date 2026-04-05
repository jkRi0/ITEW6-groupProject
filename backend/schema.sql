CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','faculty','admin') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  student_number VARCHAR(64) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(32) NULL,
  date_of_birth DATE NULL,
  email VARCHAR(255) NULL,
  contact_number VARCHAR(64) NULL,
  nationality VARCHAR(100) NULL,
  residency_status VARCHAR(100) NULL,
  present_address VARCHAR(255) NULL,
  permanent_address VARCHAR(255) NULL,
  emergency_contact_name VARCHAR(255) NULL,
  emergency_contact_relationship VARCHAR(100) NULL,
  emergency_contact_number VARCHAR(64) NULL,
  last_school_attended VARCHAR(255) NULL,
  academic_status VARCHAR(64) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS faculty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(32) NULL,
  email VARCHAR(255) NULL,
  contact_number VARCHAR(64) NULL,
  expertise VARCHAR(255) NULL,
  educational_background TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  units INT NULL
);

CREATE TABLE IF NOT EXISTS sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  section_name VARCHAR(64) NOT NULL,
  academic_year VARCHAR(16) NOT NULL,
  term VARCHAR(16) NOT NULL,
  UNIQUE KEY uq_sections_course_section_term (course_id, section_name, academic_year, term),
  KEY idx_sections_course_id (course_id),
  CONSTRAINT fk_sections_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_id INT NOT NULL,
  faculty_id INT NOT NULL,
  room VARCHAR(64) NULL,
  lab VARCHAR(64) NULL,
  days_of_week VARCHAR(32) NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  KEY idx_schedules_section_id (section_id),
  KEY idx_schedules_faculty_id (faculty_id),
  CONSTRAINT fk_schedules_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  CONSTRAINT fk_schedules_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  section_id INT NOT NULL,
  status VARCHAR(32) NULL,
  date_enrolled DATE NULL,
  UNIQUE KEY uq_enrollments_student_section (student_id, section_id),
  KEY idx_enrollments_student_id (student_id),
  KEY idx_enrollments_section_id (section_id),
  CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  academic_year VARCHAR(16) NULL,
  term VARCHAR(16) NULL,
  syllabus LONGTEXT NULL,
  curriculum LONGTEXT NULL,
  CONSTRAINT fk_course_materials_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NULL,
  order_index INT NULL,
  CONSTRAINT fk_lessons_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS student_leadership (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  organization_id INT NOT NULL,
  designation VARCHAR(255) NOT NULL,
  academic_year VARCHAR(16) NOT NULL,
  date_assigned DATE NOT NULL,
  date_ended DATE NULL,
  CONSTRAINT fk_student_leadership_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_leadership_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS faculty_leadership (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  organization_id INT NOT NULL,
  designation VARCHAR(255) NOT NULL,
  academic_year VARCHAR(16) NOT NULL,
  date_assigned DATE NOT NULL,
  date_ended DATE NULL,
  CONSTRAINT fk_faculty_leadership_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
  CONSTRAINT fk_faculty_leadership_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS sports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(255) NULL,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS student_sports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  sport_id INT NOT NULL,
  academic_year VARCHAR(16) NULL,
  term_or_season VARCHAR(32) NULL,
  role VARCHAR(64) NULL,
  participation_level VARCHAR(64) NULL,
  participation_notes TEXT NULL,
  CONSTRAINT fk_student_sports_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_sports_sport FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS student_achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NULL,
  date_awarded DATE NULL,
  level VARCHAR(64) NULL,
  description TEXT NULL,
  CONSTRAINT fk_student_achievements_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS faculty_achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NULL,
  date_awarded DATE NULL,
  level VARCHAR(64) NULL,
  description TEXT NULL,
  CONSTRAINT fk_faculty_achievements_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_violations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  violation_type VARCHAR(255) NOT NULL,
  description TEXT NULL,
  date_reported DATE NOT NULL,
  sanction VARCHAR(255) NULL,
  status VARCHAR(64) NULL,
  CONSTRAINT fk_student_violations_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  condition_type VARCHAR(255) NULL,
  notes TEXT NULL,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated_by_user_id INT NULL,
  CONSTRAINT fk_student_medical_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_medical_user FOREIGN KEY (last_updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS student_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  skill_id INT NOT NULL,
  level VARCHAR(32) NULL,
  evidence_url VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_student_skills_student_skill (student_id, skill_id),
  KEY idx_student_skills_student_id (student_id),
  KEY idx_student_skills_skill_id (skill_id),
  CONSTRAINT fk_student_skills_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS student_course_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  academic_year VARCHAR(16) NOT NULL,
  term VARCHAR(16) NOT NULL,
  status VARCHAR(32) NOT NULL,
  final_grade VARCHAR(16) NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  recorded_by_user_id INT NULL,
  UNIQUE KEY uq_student_course_records_student_course_term (student_id, course_id, academic_year, term),
  KEY idx_student_course_records_student_id (student_id),
  KEY idx_student_course_records_course_id (course_id),
  KEY idx_student_course_records_recorded_by (recorded_by_user_id),
  CONSTRAINT fk_student_course_records_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_course_records_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
  CONSTRAINT fk_student_course_records_user FOREIGN KEY (recorded_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  event_date DATE NULL,
  location VARCHAR(255) NULL,
  created_by_user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_user FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS event_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  student_id INT NOT NULL,
  role VARCHAR(64) NULL,
  status VARCHAR(32) NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_event_participants_event_student (event_id, student_id),
  KEY idx_event_participants_event_id (event_id),
  KEY idx_event_participants_student_id (student_id),
  CONSTRAINT fk_event_participants_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_event_participants_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_advising_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  faculty_id INT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_user_id INT NULL,
  CONSTRAINT fk_student_advising_notes_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_advising_notes_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL,
  CONSTRAINT fk_student_advising_notes_user FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_type VARCHAR(32) NOT NULL,
  owner_id INT NOT NULL,
  doc_type VARCHAR(64) NOT NULL,
  file_url VARCHAR(1024) NOT NULL,
  uploaded_by_user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_user FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_user_id INT NULL,
  action VARCHAR(64) NOT NULL,
  entity VARCHAR(64) NOT NULL,
  entity_id INT NOT NULL,
  before_json LONGTEXT NULL,
  after_json LONGTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target_role VARCHAR(32) NULL,
  target_user_id INT NULL,
  created_by_user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_target_user FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notification_reads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notification_id INT NOT NULL,
  user_id INT NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_notification_reads_notification_user (notification_id, user_id),
  KEY idx_notification_reads_notification_id (notification_id),
  KEY idx_notification_reads_user_id (user_id),
  CONSTRAINT fk_notification_reads_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_reads_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
