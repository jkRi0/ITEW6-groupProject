-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 27, 2026 at 08:58 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ccs_profiling_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `actor_user_id` int(11) DEFAULT NULL,
  `action` varchar(64) NOT NULL,
  `entity` varchar(64) NOT NULL,
  `entity_id` int(11) NOT NULL,
  `before_json` longtext DEFAULT NULL,
  `after_json` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `actor_user_id`, `action`, `entity`, `entity_id`, `before_json`, `after_json`, `created_at`) VALUES
(1, 3, 'SEED', 'courses', 1, NULL, NULL, '2026-04-05 18:26:54'),
(2, 3, 'SEED', 'courses', 2, NULL, NULL, '2026-04-05 18:26:54'),
(3, 3, 'SEED', 'sections', 1, NULL, NULL, '2026-04-05 18:26:54'),
(4, 3, 'SEED', 'students', 1, NULL, NULL, '2026-04-05 18:26:54'),
(5, 3, 'SEED', 'faculty', 1, NULL, NULL, '2026-04-05 18:26:54');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `code` varchar(32) NOT NULL,
  `title` varchar(255) NOT NULL,
  `units` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `code`, `title`, `units`) VALUES
(1, 'CCS101', 'Intro to Computing', 3),
(2, 'CCS102', 'Programming 1', 3),
(3, 'CCS201', 'Data Structures', 3),
(4, 'CCS202', 'Database Systems', 3),
(5, 'CCS301', 'Software Engineering', 3);

-- --------------------------------------------------------

--
-- Table structure for table `course_materials`
--

CREATE TABLE `course_materials` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `academic_year` varchar(16) DEFAULT NULL,
  `term` varchar(16) DEFAULT NULL,
  `syllabus` longtext DEFAULT NULL,
  `curriculum` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_materials`
--

INSERT INTO `course_materials` (`id`, `course_id`, `academic_year`, `term`, `syllabus`, `curriculum`) VALUES
(1, 1, '2024-2025', '1', 'Intro to Computing Syllabus\n\n1. Basic Computer Concepts\n2. Hardware and Software\n3. Operating Systems\n4. Networking Basics', 'Course Curriculum: 15 weeks total. 3 hours per week.'),
(2, 2, '2024-2025', '1', 'Programming 1 Syllabus\n\n1. Logic Formulation\n2. Basic Syntax\n3. Control Structures\n4. Loops and Arrays', 'Prerequisite for Programming 2. Hands-on coding in C++.');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `owner_type` varchar(32) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `doc_type` varchar(64) NOT NULL,
  `file_url` varchar(1024) NOT NULL,
  `uploaded_by_user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `status` varchar(32) DEFAULT NULL,
  `date_enrolled` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `student_id`, `section_id`, `status`, `date_enrolled`) VALUES
(1, 1, 1, 'enrolled', '2024-08-15'),
(2, 1, 2, 'enrolled', '2024-08-15'),
(3, 2, 1, 'enrolled', '2024-08-15'),
(4, 3, 3, 'enrolled', '2024-08-15'),
(5, 4, 4, 'enrolled', '2024-08-15');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_by_user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_participants`
--

CREATE TABLE `event_participants` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `role` varchar(64) DEFAULT NULL,
  `status` varchar(32) DEFAULT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `gender` varchar(32) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contact_number` varchar(64) DEFAULT NULL,
  `expertise` varchar(255) DEFAULT NULL,
  `educational_background` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`id`, `user_id`, `first_name`, `middle_name`, `last_name`, `gender`, `email`, `contact_number`, `expertise`, `educational_background`, `created_at`, `updated_at`) VALUES
(1, 2, 'Faculty', NULL, 'Sample', NULL, 'faculty@asd.com', NULL, 'Software Engineering', NULL, '2026-04-05 18:26:54', NULL),
(2, NULL, 'Maria', NULL, 'Dela Cruz', NULL, 'maria.delacruz@example.com', NULL, 'Databases', NULL, '2026-04-05 18:26:54', NULL),
(3, NULL, 'Jose', NULL, 'Garcia', NULL, 'jose.garcia@example.com', NULL, 'Networks', NULL, '2026-04-05 18:26:54', NULL),
(4, NULL, 'Lina', NULL, 'Torres', NULL, 'lina.torres@example.com', NULL, 'Web Development', NULL, '2026-04-05 18:26:54', NULL),
(5, NULL, 'Paolo', NULL, 'Ramos', NULL, 'paolo.ramos@example.com', NULL, 'AI / ML', NULL, '2026-04-05 18:26:54', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `faculty_achievements`
--

CREATE TABLE `faculty_achievements` (
  `id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `issuer` varchar(255) DEFAULT NULL,
  `date_awarded` date DEFAULT NULL,
  `level` varchar(64) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_leadership`
--

CREATE TABLE `faculty_leadership` (
  `id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `academic_year` varchar(16) NOT NULL,
  `date_assigned` date NOT NULL,
  `date_ended` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` longtext DEFAULT NULL,
  `order_index` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`id`, `course_id`, `title`, `content`, `order_index`) VALUES
(1, 1, 'History of Computers', 'Early computing devices: Abacus, ENIAC, etc.', 1),
(2, 1, 'Data Representation', 'Binary, Octal, Hexadecimal number systems.', 2),
(3, 2, 'Getting Started with C++', 'Hello World and basic syntax.', 1),
(4, 2, 'Variables and Data Types', 'Integers, floats, chars, and booleans.', 2),
(5, 2, 'Control Statements', 'If-else and Switch cases.', 3);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `target_role` varchar(32) DEFAULT NULL,
  `target_user_id` int(11) DEFAULT NULL,
  `created_by_user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `title`, `message`, `target_role`, `target_user_id`, `created_by_user_id`, `created_at`) VALUES
(1, 'Welcome to CPS', 'Your account is ready. Explore your dashboard.', 'student', NULL, 3, '2026-04-05 18:26:54'),
(2, 'Complete your profile', 'Please update your profile details and documents.', 'student', NULL, 3, '2026-04-05 18:26:54'),
(3, 'Grade encoding reminder', 'Please encode grades before the deadline.', 'faculty', NULL, 3, '2026-04-05 18:26:54'),
(4, 'System maintenance', 'Maintenance window this weekend.', NULL, NULL, 3, '2026-04-05 18:26:54'),
(5, 'Admin notice', 'Review new registrations and audit logs.', 'admin', NULL, 3, '2026-04-05 18:26:54');

-- --------------------------------------------------------

--
-- Table structure for table `notification_reads`
--

CREATE TABLE `notification_reads` (
  `id` int(11) NOT NULL,
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organizations`
--

CREATE TABLE `organizations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `room` varchar(64) DEFAULT NULL,
  `lab` varchar(64) DEFAULT NULL,
  `days_of_week` varchar(32) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `section_id`, `faculty_id`, `room`, `lab`, `days_of_week`, `start_time`, `end_time`) VALUES
(1, 1, 1, 'Room 204', NULL, 'MWF', '09:00:00', '10:00:00'),
(2, 2, 1, NULL, 'Lab 3', 'TTH', '13:00:00', '14:30:00'),
(3, 3, 2, 'Room 301', NULL, 'MWF', '10:30:00', '11:30:00'),
(4, 4, 3, 'Room 110', NULL, 'TTH', '09:00:00', '10:30:00'),
(5, 5, 4, 'Room 220', NULL, 'SAT', '08:00:00', '11:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `section_name` varchar(64) NOT NULL,
  `academic_year` varchar(16) NOT NULL,
  `term` varchar(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`id`, `course_id`, `section_name`, `academic_year`, `term`) VALUES
(1, 1, 'BSIT-1A', '2024-2025', '1'),
(2, 2, 'BSIT-1A', '2024-2025', '1'),
(3, 3, 'BSIT-2A', '2024-2025', '1'),
(4, 4, 'BSIT-2A', '2024-2025', '1'),
(5, 5, 'BSIT-3A', '2024-2025', '1');

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `skills`
--

INSERT INTO `skills` (`id`, `name`) VALUES
(4, 'Communication'),
(1, 'JavaScript'),
(3, 'Problem Solving'),
(2, 'SQL'),
(5, 'Teamwork');

-- --------------------------------------------------------

--
-- Table structure for table `sports`
--

CREATE TABLE `sports` (
  `id` int(11) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `student_number` varchar(64) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `gender` varchar(32) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contact_number` varchar(64) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `residency_status` varchar(100) DEFAULT NULL,
  `present_address` varchar(255) DEFAULT NULL,
  `permanent_address` varchar(255) DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_relationship` varchar(100) DEFAULT NULL,
  `emergency_contact_number` varchar(64) DEFAULT NULL,
  `last_school_attended` varchar(255) DEFAULT NULL,
  `academic_status` varchar(64) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `user_id`, `student_number`, `first_name`, `middle_name`, `last_name`, `gender`, `date_of_birth`, `email`, `contact_number`, `nationality`, `residency_status`, `present_address`, `permanent_address`, `emergency_contact_name`, `emergency_contact_relationship`, `emergency_contact_number`, `last_school_attended`, `academic_status`, `created_at`, `updated_at`) VALUES
(1, 1, '2024-0001', 'Student', NULL, 'Sample', NULL, NULL, 'student@asd.com', NULL, 'Filipino', NULL, 'City Proper', NULL, 'Sample Guardian', 'Parent', '09171234567', NULL, 'Regular', '2026-04-05 18:26:54', NULL),
(2, NULL, '2024-0002', 'Aira', NULL, 'Reyes', 'Female', NULL, 'aira.reyes@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Regular', '2026-04-05 18:26:54', NULL),
(3, NULL, '2024-0003', 'Ben', NULL, 'Cruz', 'Male', NULL, 'ben.cruz@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Probation', '2026-04-05 18:26:54', NULL),
(4, NULL, '2024-0004', 'Carla', NULL, 'Santos', 'Female', NULL, 'carla.santos@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Regular', '2026-04-05 18:26:54', NULL),
(5, NULL, '2024-0005', 'Diego', NULL, 'Lopez', 'Male', NULL, 'diego.lopez@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Regular', '2026-04-05 18:26:54', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_achievements`
--

CREATE TABLE `student_achievements` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `issuer` varchar(255) DEFAULT NULL,
  `date_awarded` date DEFAULT NULL,
  `level` varchar(64) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_achievements`
--

INSERT INTO `student_achievements` (`id`, `student_id`, `title`, `issuer`, `date_awarded`, `level`, `description`) VALUES
(1, 1, 'Dean\'s List', 'CCS', '2024-12-20', 'College', 'Awarded for high academic performance.'),
(2, 1, 'Hackathon Participation', 'Tech Org', '2024-10-05', 'Department', 'Participated in a 24h hackathon.'),
(3, 1, 'Perfect Attendance', 'Instructor', '2024-11-15', 'Class', 'No absences during the term.'),
(4, 1, 'Volunteer Service', 'Student Affairs', '2024-09-10', 'University', 'Helped in university event operations.'),
(5, 1, 'Best Project', 'CCS', '2024-12-01', 'Department', 'Best project in Programming 1.');

-- --------------------------------------------------------

--
-- Table structure for table `student_advising_notes`
--

CREATE TABLE `student_advising_notes` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `faculty_id` int(11) DEFAULT NULL,
  `note` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by_user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_course_records`
--

CREATE TABLE `student_course_records` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `academic_year` varchar(16) NOT NULL,
  `term` varchar(16) NOT NULL,
  `status` varchar(32) NOT NULL,
  `final_grade` varchar(16) DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `recorded_by_user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_leadership`
--

CREATE TABLE `student_leadership` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `academic_year` varchar(16) NOT NULL,
  `date_assigned` date NOT NULL,
  `date_ended` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_medical_records`
--

CREATE TABLE `student_medical_records` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `condition_type` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `last_updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_updated_by_user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_skills`
--

CREATE TABLE `student_skills` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `level` varchar(32) DEFAULT NULL,
  `evidence_url` varchar(512) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_skills`
--

INSERT INTO `student_skills` (`id`, `student_id`, `skill_id`, `level`, `evidence_url`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Intermediate', 'https://example.com/evidence/js', '2026-04-05 18:26:54', NULL),
(2, 1, 2, 'Beginner', 'https://example.com/evidence/sql', '2026-04-05 18:26:54', NULL),
(3, 1, 3, 'Intermediate', NULL, '2026-04-05 18:26:54', NULL),
(4, 1, 4, 'Intermediate', NULL, '2026-04-05 18:26:54', NULL),
(5, 1, 5, 'Advanced', NULL, '2026-04-05 18:26:54', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_sports`
--

CREATE TABLE `student_sports` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `sport_id` int(11) NOT NULL,
  `academic_year` varchar(16) DEFAULT NULL,
  `term_or_season` varchar(32) DEFAULT NULL,
  `role` varchar(64) DEFAULT NULL,
  `participation_level` varchar(64) DEFAULT NULL,
  `participation_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_violations`
--

CREATE TABLE `student_violations` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `violation_type` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `date_reported` date NOT NULL,
  `sanction` varchar(255) DEFAULT NULL,
  `status` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','faculty','admin') NOT NULL DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_disabled` tinyint(1) NOT NULL DEFAULT 0,
  `disabled_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `created_at`, `is_disabled`, `disabled_at`) VALUES
(1, 'Student Sample', 'student@asd.com', '$2b$10$N7HXxVtAbdPG852FudbqDuDqA7GMtJfcXE7iduWHlRcRegZHZT9jy', 'student', '2026-04-05 18:26:54', 0, NULL),
(2, 'Faculty Sample', 'faculty@asd.com', '$2b$10$xvCgI8I4L4fbogbmPV0eCePpmKOYlLMOfe7hdPyG2XzJbQhcBymkC', 'faculty', '2026-04-05 18:26:54', 0, NULL),
(3, 'Admin Sample', 'admin@asd.com', '$2b$10$V.ll6hq9siAPTT7eX.A4bOoufshKfbyTeCdhy5f1oQk.fuGF7qMjC', 'admin', '2026-04-05 18:26:54', 0, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_audit_logs_user` (`actor_user_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `course_materials`
--
ALTER TABLE `course_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_course_materials_course` (`course_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_documents_user` (`uploaded_by_user_id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_enrollments_student_section` (`student_id`,`section_id`),
  ADD KEY `idx_enrollments_student_id` (`student_id`),
  ADD KEY `idx_enrollments_section_id` (`section_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_events_user` (`created_by_user_id`);

--
-- Indexes for table `event_participants`
--
ALTER TABLE `event_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_event_participants_event_student` (`event_id`,`student_id`),
  ADD KEY `idx_event_participants_event_id` (`event_id`),
  ADD KEY `idx_event_participants_student_id` (`student_id`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `faculty_achievements`
--
ALTER TABLE `faculty_achievements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_faculty_achievements_faculty` (`faculty_id`);

--
-- Indexes for table `faculty_leadership`
--
ALTER TABLE `faculty_leadership`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_faculty_leadership_faculty` (`faculty_id`),
  ADD KEY `fk_faculty_leadership_org` (`organization_id`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_lessons_course` (`course_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notifications_target_user` (`target_user_id`),
  ADD KEY `fk_notifications_created_by` (`created_by_user_id`);

--
-- Indexes for table `notification_reads`
--
ALTER TABLE `notification_reads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_notification_reads_notification_user` (`notification_id`,`user_id`),
  ADD KEY `idx_notification_reads_notification_id` (`notification_id`),
  ADD KEY `idx_notification_reads_user_id` (`user_id`);

--
-- Indexes for table `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_schedules_section_id` (`section_id`),
  ADD KEY `idx_schedules_faculty_id` (`faculty_id`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_sections_course_section_term` (`course_id`,`section_name`,`academic_year`,`term`),
  ADD KEY `idx_sections_course_id` (`course_id`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `sports`
--
ALTER TABLE `sports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_number` (`student_number`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `student_achievements`
--
ALTER TABLE `student_achievements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_student_achievements_student` (`student_id`);

--
-- Indexes for table `student_advising_notes`
--
ALTER TABLE `student_advising_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_student_advising_notes_student` (`student_id`),
  ADD KEY `fk_student_advising_notes_faculty` (`faculty_id`),
  ADD KEY `fk_student_advising_notes_user` (`created_by_user_id`);

--
-- Indexes for table `student_course_records`
--
ALTER TABLE `student_course_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_course_records_student_course_term` (`student_id`,`course_id`,`academic_year`,`term`),
  ADD KEY `idx_student_course_records_student_id` (`student_id`),
  ADD KEY `idx_student_course_records_course_id` (`course_id`),
  ADD KEY `idx_student_course_records_recorded_by` (`recorded_by_user_id`);

--
-- Indexes for table `student_leadership`
--
ALTER TABLE `student_leadership`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_student_leadership_student` (`student_id`),
  ADD KEY `fk_student_leadership_org` (`organization_id`);

--
-- Indexes for table `student_medical_records`
--
ALTER TABLE `student_medical_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_student_medical_student` (`student_id`),
  ADD KEY `fk_student_medical_user` (`last_updated_by_user_id`);

--
-- Indexes for table `student_skills`
--
ALTER TABLE `student_skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_skills_student_skill` (`student_id`,`skill_id`),
  ADD KEY `idx_student_skills_student_id` (`student_id`),
  ADD KEY `idx_student_skills_skill_id` (`skill_id`);

--
-- Indexes for table `student_sports`
--
ALTER TABLE `student_sports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_student_sports_student` (`student_id`),
  ADD KEY `fk_student_sports_sport` (`sport_id`);

--
-- Indexes for table `student_violations`
--
ALTER TABLE `student_violations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_student_violations_student` (`student_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `course_materials`
--
ALTER TABLE `course_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_participants`
--
ALTER TABLE `event_participants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `faculty_achievements`
--
ALTER TABLE `faculty_achievements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_leadership`
--
ALTER TABLE `faculty_leadership`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notification_reads`
--
ALTER TABLE `notification_reads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sports`
--
ALTER TABLE `sports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `student_achievements`
--
ALTER TABLE `student_achievements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `student_advising_notes`
--
ALTER TABLE `student_advising_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_course_records`
--
ALTER TABLE `student_course_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_leadership`
--
ALTER TABLE `student_leadership`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_medical_records`
--
ALTER TABLE `student_medical_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_skills`
--
ALTER TABLE `student_skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `student_sports`
--
ALTER TABLE `student_sports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_violations`
--
ALTER TABLE `student_violations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `course_materials`
--
ALTER TABLE `course_materials`
  ADD CONSTRAINT `fk_course_materials_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `fk_documents_user` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `fk_enrollments_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_enrollments_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `fk_events_user` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `event_participants`
--
ALTER TABLE `event_participants`
  ADD CONSTRAINT `fk_event_participants_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_event_participants_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty`
--
ALTER TABLE `faculty`
  ADD CONSTRAINT `fk_faculty_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `faculty_achievements`
--
ALTER TABLE `faculty_achievements`
  ADD CONSTRAINT `fk_faculty_achievements_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_leadership`
--
ALTER TABLE `faculty_leadership`
  ADD CONSTRAINT `fk_faculty_leadership_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_faculty_leadership_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`);

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `fk_lessons_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notifications_target_user` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notification_reads`
--
ALTER TABLE `notification_reads`
  ADD CONSTRAINT `fk_notification_reads_notification` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notification_reads_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `fk_schedules_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`),
  ADD CONSTRAINT `fk_schedules_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `fk_sections_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_achievements`
--
ALTER TABLE `student_achievements`
  ADD CONSTRAINT `fk_student_achievements_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_advising_notes`
--
ALTER TABLE `student_advising_notes`
  ADD CONSTRAINT `fk_student_advising_notes_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_student_advising_notes_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_student_advising_notes_user` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_course_records`
--
ALTER TABLE `student_course_records`
  ADD CONSTRAINT `fk_student_course_records_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `fk_student_course_records_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_student_course_records_user` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_leadership`
--
ALTER TABLE `student_leadership`
  ADD CONSTRAINT `fk_student_leadership_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  ADD CONSTRAINT `fk_student_leadership_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_medical_records`
--
ALTER TABLE `student_medical_records`
  ADD CONSTRAINT `fk_student_medical_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_student_medical_user` FOREIGN KEY (`last_updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_skills`
--
ALTER TABLE `student_skills`
  ADD CONSTRAINT `fk_student_skills_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`),
  ADD CONSTRAINT `fk_student_skills_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_sports`
--
ALTER TABLE `student_sports`
  ADD CONSTRAINT `fk_student_sports_sport` FOREIGN KEY (`sport_id`) REFERENCES `sports` (`id`),
  ADD CONSTRAINT `fk_student_sports_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_violations`
--
ALTER TABLE `student_violations`
  ADD CONSTRAINT `fk_student_violations_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
