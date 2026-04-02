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
  CONSTRAINT fk_schedules_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  CONSTRAINT fk_schedules_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  section_id INT NOT NULL,
  status VARCHAR(32) NULL,
  date_enrolled DATE NULL,
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
