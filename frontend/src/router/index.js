import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '../components/HomePage.vue'
import StudentInformationPage from '../pages/StudentInformationPage.vue'
import FacultyPage from '../pages/FacultyPage.vue'
import InstructionPage from '../pages/InstructionPage.vue'
import SchedulingPage from '../pages/SchedulingPage.vue'
import EventsPage from '../pages/EventsPage.vue'
import SearchFilterPage from '../pages/SearchFilterPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import StudentAccountPage from '../pages/StudentAccountPage.vue'
import FacultyAccountPage from '../pages/FacultyAccountPage.vue'

import RoleLayout from '../layouts/RoleLayout.vue'
import ModulePlaceholderPage from '../pages/ModulePlaceholderPage.vue'
import StudentDashboardPage from '../pages/StudentDashboardPage.vue'
import StudentSchedulePage from '../pages/StudentSchedulePage.vue'
import StudentEnrollmentsPage from '../pages/StudentEnrollmentsPage.vue'
import StudentAcademicRecordsPage from '../pages/StudentAcademicRecordsPage.vue'
import StudentSkillsPage from '../pages/StudentSkillsPage.vue'
import StudentLeadershipPage from '../pages/StudentLeadershipPage.vue'
import FacultyDashboardPage from '../pages/FacultyDashboardPage.vue'
import AdminDashboardPage from '../pages/AdminDashboardPage.vue'
import AdminCrudPage from '../pages/AdminCrudPage.vue'
import AdminUsersPage from '../pages/AdminUsersPage.vue'
import AdminUserDetailsPage from '../pages/AdminUserDetailsPage.vue'
import StudentProfilePage from '../pages/StudentProfilePage.vue'
import StudentMaterialsPage from '../pages/StudentMaterialsPage.vue'
import FacultyProfilePage from '../pages/FacultyProfilePage.vue'

function redirectByRole(targets) {
  return () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!isAuthenticated) return '/login'

    const role = user.role
    if (role && targets[role]) return targets[role]
    return targets.default || '/'
  }
}

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/login', name: 'login', component: LoginPage },
  { path: '/register', name: 'register', component: RegisterPage },

  // Legacy routes (kept for backward compatibility) -> redirect into role-based app
  { path: '/student-account', name: 'student-account', component: StudentAccountPage, meta: { requiresAuth: true, role: 'student' }, beforeEnter: redirectByRole({ student: '/student/dashboard', default: '/student/dashboard' }) },
  { path: '/faculty-account', name: 'faculty-account', component: FacultyAccountPage, meta: { requiresAuth: true, role: 'faculty' }, beforeEnter: redirectByRole({ faculty: '/faculty/dashboard', default: '/faculty/dashboard' }) },

  { path: '/student-information', name: 'student-information', component: StudentInformationPage, meta: { requiresAuth: true }, beforeEnter: redirectByRole({ student: '/student/profile', faculty: '/faculty/student-profile', admin: '/admin/students', default: '/student/dashboard' }) },
  { path: '/faculty', name: 'faculty', component: FacultyPage, meta: { requiresAuth: true }, beforeEnter: redirectByRole({ faculty: '/faculty/classes', admin: '/admin/faculty', student: '/student/dashboard', default: '/student/dashboard' }) },
  { path: '/instruction', name: 'instruction', component: InstructionPage, meta: { requiresAuth: true }, beforeEnter: redirectByRole({ student: '/student/materials', faculty: '/faculty/materials', admin: '/admin/courses', default: '/student/dashboard' }) },
  { path: '/scheduling', name: 'scheduling', component: SchedulingPage, meta: { requiresAuth: true }, beforeEnter: redirectByRole({ student: '/student/schedule', faculty: '/faculty/classes', admin: '/admin/schedules', default: '/student/dashboard' }) },
  { path: '/events', name: 'events', component: EventsPage, meta: { requiresAuth: true }, beforeEnter: redirectByRole({ student: '/student/events', faculty: '/faculty/events', admin: '/admin/non-academic', default: '/student/dashboard' }) },
  { path: '/search-filter', name: 'search-filter', component: SearchFilterPage, meta: { requiresAuth: true }, beforeEnter: redirectByRole({ student: '/student/academic-records', faculty: '/faculty/roster', admin: '/admin/students', default: '/student/dashboard' }) },

  {
    path: '/student',
    component: RoleLayout,
    meta: { requiresAuth: true, role: 'student' },
    redirect: '/student/dashboard',
    children: [
      { path: 'dashboard', component: StudentDashboardPage },
      { path: 'profile', component: StudentProfilePage },
      { path: 'schedule', component: StudentSchedulePage },
      { path: 'enrollments', component: StudentEnrollmentsPage },
      { path: 'academic-records', component: StudentAcademicRecordsPage },
      { path: 'materials', component: StudentMaterialsPage },
      { path: 'skills', component: StudentSkillsPage },
      { 
        path: 'achievements', 
        component: ModulePlaceholderPage,
        meta: { 
          title: 'Achievements', 
          kicker: '04', 
          description: 'Recognitions, awards, and certifications.',
          showFilters: true,
          apiPath: '/skills/student/achievements'
        }
      },
      { path: 'leadership', component: StudentLeadershipPage },
      { 
        path: 'sports', 
        component: ModulePlaceholderPage,
        meta: { 
          title: 'Sports & Activities', 
          kicker: '06', 
          description: 'Athletic participation and extra-curricular activities.',
          showFilters: true,
          apiPath: '/skills/student/sports' 
        }
      },
      { 
        path: 'events', 
        component: ModulePlaceholderPage,
        meta: { 
          title: 'Events / Trainings', 
          kicker: '07', 
          description: 'Seminars, workshops, and school events.',
          showFilters: true,
          apiPath: '/skills/student/events'
        }
      },
      { path: 'notifications', component: ModulePlaceholderPage, meta: { title: 'Notifications', description: 'Read/unread notifications (mock for now).', kicker: 'STUDENT', showFilters: true, apiPath: '/notifications/my' } }
    ]
  },

  {
    path: '/faculty',
    component: RoleLayout,
    meta: { requiresAuth: true, role: 'faculty' },
    redirect: '/faculty/dashboard',
    children: [
      { path: 'dashboard', component: FacultyDashboardPage },
      { path: 'profile', component: FacultyProfilePage },
      { path: 'classes', component: ModulePlaceholderPage, meta: { title: 'My Classes / Sections', description: 'Assigned sections list with filters.', kicker: 'FACULTY', showFilters: true, apiPath: '/academics/faculty/sections' } },
      { path: 'student-profile', component: ModulePlaceholderPage, meta: { title: 'Student Search & Profile', description: 'Search and view student profiles.', kicker: 'FACULTY', showFilters: true, apiPath: '/academics/faculty/students' } },
      { path: 'academic-records', component: ModulePlaceholderPage, meta: { title: 'Academic Records Management', description: 'Encode grades and update statuses.', kicker: 'FACULTY', showFilters: true, apiPath: '/academics/faculty/grades' } },
      { path: 'materials', component: ModulePlaceholderPage, meta: { title: 'Teaching Materials', description: 'Upload/edit syllabus and manage lessons.', kicker: 'FACULTY', apiPath: '/academics/faculty/materials' } },
      { path: 'events', component: ModulePlaceholderPage, meta: { title: 'Events Participation', description: 'Track student participation.', kicker: 'FACULTY', showFilters: true, apiPath: '/academics/faculty/events' } },
      { path: 'violations', component: ModulePlaceholderPage, meta: { title: 'Violations', description: 'Limited access for handled students.', kicker: 'FACULTY', showFilters: true, apiPath: '/academics/faculty/violations' } },
      { path: 'affiliations', component: ModulePlaceholderPage, meta: { title: 'Achievements & Leadership', description: 'Faculty achievements and org roles.', kicker: 'FACULTY', showFilters: true, apiPath: '/academics/faculty/affiliations' } },
      { path: 'notifications', component: ModulePlaceholderPage, meta: { title: 'Notifications', description: 'Read/unread notifications.', kicker: 'FACULTY', showFilters: true, apiPath: '/notifications/my' } }
    ]
  },

  {
    path: '/admin',
    component: RoleLayout,
    meta: { requiresAuth: true, role: 'admin' },
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard', component: AdminDashboardPage },
      {
        path: 'users',
        component: AdminUsersPage,
        meta: { requiresAuth: true, role: 'admin' },
      },
      {
        path: 'users/:id',
        component: AdminUserDetailsPage,
        meta: { requiresAuth: true, role: 'admin' },
      },
      {
        path: 'users/manage',
        component: AdminCrudPage,
        meta: {
          role: 'admin',
          crud: {
            title: 'User Management',
            apiBase: '/admin/users',
            columns: ['id', 'full_name', 'email', 'role', 'is_disabled', 'created_at'],
            fields: [
              { key: 'full_name', label: 'Full Name' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role', placeholder: 'student / faculty / admin' },
              { key: 'password', label: 'Password', createOnly: true }
            ],
            actions: [
              {
                key: 'toggle',
                label: (row) => (Number(row.is_disabled) === 1 ? 'Enable' : 'Disable'),
                method: 'POST',
                path: (row) => (Number(row.is_disabled) === 1 ? '/admin/users/:id/enable' : '/admin/users/:id/disable'),
                confirm: (row) => (Number(row.is_disabled) === 1 ? `Enable user #${row.id}?` : `Disable user #${row.id}?`)
              },
              {
                key: 'reset',
                label: 'Reset Password',
                method: 'POST',
                path: '/admin/users/:id/reset-password',
                prompt: (row) => `Enter new password for ${row.email}`
              }
            ]
          }
        }
      },
      {
        path: 'students',
        component: AdminCrudPage,
        meta: {
          role: 'admin',
          crud: {
            title: 'Student Management',
            apiBase: '/admin/students',
            columns: ['id', 'student_number', 'first_name', 'last_name', 'academic_status', 'email'],
            fields: [
              { key: 'student_number', label: 'Student Number' },
              { key: 'first_name', label: 'First Name' },
              { key: 'middle_name', label: 'Middle Name' },
              { key: 'last_name', label: 'Last Name' },
              { key: 'gender', label: 'Gender' },
              { key: 'date_of_birth', label: 'Date of Birth', placeholder: 'YYYY-MM-DD' },
              { key: 'email', label: 'Email' },
              { key: 'contact_number', label: 'Contact Number' },
              { key: 'nationality', label: 'Nationality' },
              { key: 'residency_status', label: 'Residency Status' },
              { key: 'present_address', label: 'Present Address' },
              { key: 'permanent_address', label: 'Permanent Address' },
              { key: 'emergency_contact_name', label: 'Emergency Contact Name' },
              { key: 'emergency_contact_relationship', label: 'Emergency Contact Relationship' },
              { key: 'emergency_contact_number', label: 'Emergency Contact Number' },
              { key: 'last_school_attended', label: 'Last School Attended' },
              { key: 'academic_status', label: 'Academic Status' }
            ]
          }
        }
      },
      {
        path: 'faculty',
        component: AdminCrudPage,
        meta: {
          role: 'admin',
          crud: {
            title: 'Faculty Management',
            apiBase: '/admin/faculty',
            columns: ['id', 'first_name', 'last_name', 'email', 'expertise'],
            fields: [
              { key: 'first_name', label: 'First Name' },
              { key: 'middle_name', label: 'Middle Name' },
              { key: 'last_name', label: 'Last Name' },
              { key: 'gender', label: 'Gender' },
              { key: 'email', label: 'Email' },
              { key: 'contact_number', label: 'Contact Number' },
              { key: 'expertise', label: 'Expertise' },
              { key: 'educational_background', label: 'Educational Background', type: 'textarea' }
            ]
          }
        }
      },
      {
        path: 'courses',
        component: AdminCrudPage,
        meta: {
          role: 'admin',
          crud: {
            title: 'Course Management',
            apiBase: '/admin/courses',
            columns: ['id', 'code', 'title', 'units'],
            fields: [
              { key: 'code', label: 'Code' },
              { key: 'title', label: 'Title' },
              { key: 'units', label: 'Units', type: 'number' }
            ]
          }
        }
      },
      {
        path: 'sections',
        component: AdminCrudPage,
        meta: {
          role: 'admin',
          crud: {
            title: 'Section Management',
            apiBase: '/admin/sections',
            columns: ['id', 'course_id', 'course_code', 'section_name', 'academic_year', 'term'],
            fields: [
              { key: 'course_id', label: 'Course ID', type: 'number' },
              { key: 'section_name', label: 'Section Name' },
              { key: 'academic_year', label: 'Academic Year', placeholder: '2024-2025' },
              { key: 'term', label: 'Term', placeholder: '1' }
            ]
          }
        }
      },
      {
        path: 'schedules',
        component: AdminCrudPage,
        meta: {
          role: 'admin',
          crud: {
            title: 'Schedule Management',
            apiBase: '/admin/schedules',
            columns: ['id', 'section_id', 'section_name', 'course_code', 'faculty_id', 'first_name', 'last_name', 'days_of_week', 'start_time', 'end_time'],
            fields: [
              { key: 'section_id', label: 'Section ID', type: 'number' },
              { key: 'faculty_id', label: 'Faculty ID', type: 'number' },
              { key: 'room', label: 'Room' },
              { key: 'lab', label: 'Lab' },
              { key: 'days_of_week', label: 'Days', placeholder: 'MWF / TTH' },
              { key: 'start_time', label: 'Start Time', placeholder: '09:00:00' },
              { key: 'end_time', label: 'End Time', placeholder: '10:00:00' }
            ]
          }
        }
      },
      {
        path: 'enrollments',
        component: AdminCrudPage,
        meta: {
          role: 'admin',
          crud: {
            title: 'Enrollment Management',
            apiBase: '/admin/enrollments',
            columns: ['id', 'student_id', 'student_number', 'section_id', 'section_name', 'course_code', 'status', 'date_enrolled'],
            fields: [
              { key: 'student_id', label: 'Student ID', type: 'number' },
              { key: 'section_id', label: 'Section ID', type: 'number' },
              { key: 'status', label: 'Status' },
              { key: 'date_enrolled', label: 'Date Enrolled', placeholder: 'YYYY-MM-DD' }
            ]
          }
        }
      },
      { path: 'academic-records', component: ModulePlaceholderPage, meta: { title: 'Academic Records', description: 'View and manage student grades.', kicker: 'ADMIN', showFilters: true, apiPath: '/admin/academic-records' } },
      { path: 'non-academic', component: ModulePlaceholderPage, meta: { title: 'Non-Academic', description: 'Manage achievements and sports participation.', kicker: 'ADMIN', showFilters: true, apiPath: '/admin/non-academic' } },
      {
        path: 'skills',
        component: AdminCrudPage,
        meta: {
          role: 'admin',
          crud: {
            title: 'Skills Management',
            apiBase: '/admin/skills',
            columns: ['id', 'name'],
            fields: [
              { key: 'name', label: 'Skill Name' }
            ]
          }
        }
      },
      { path: 'affiliations', component: ModulePlaceholderPage, meta: { title: 'Affiliations', description: 'Manage student organization leadership.', kicker: 'ADMIN', showFilters: true, apiPath: '/admin/affiliations' } },
      { path: 'violations', component: ModulePlaceholderPage, meta: { title: 'Violations', description: 'Track and manage student disciplinary records.', kicker: 'ADMIN', showFilters: true, apiPath: '/admin/violations' } },
      { path: 'medical', component: ModulePlaceholderPage, meta: { title: 'Medical Records', description: 'Manage student health and medical records.', kicker: 'ADMIN', showFilters: true, apiPath: '/admin/medical' } },
      {
        path: 'notifications',
        component: AdminCrudPage,
        meta: {
          role: 'admin',
          crud: {
            title: 'Notifications Management',
            apiBase: '/admin/notifications',
            columns: ['id', 'title', 'target_role', 'target_user_id', 'created_at'],
            fields: [
              { key: 'title', label: 'Title' },
              { key: 'message', label: 'Message', type: 'textarea' },
              { key: 'target_role', label: 'Target Role', placeholder: 'student / faculty / admin (or blank)' },
              { key: 'target_user_id', label: 'Target User ID', type: 'number' }
            ]
          }
        }
      },
      { path: 'audit-logs', component: ModulePlaceholderPage, meta: { title: 'Audit Logs', description: 'Activity history with filters (mock for now).', kicker: 'ADMIN', showFilters: true, apiPath: '/admin/activity' } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const requiresAuth = to.matched.some((record) => record.meta && record.meta.requiresAuth)
  const requiredRoleRecord = to.matched.find((record) => record.meta && record.meta.role)
  const requiredRole = requiredRoleRecord ? requiredRoleRecord.meta.role : null

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (requiresAuth && requiredRole && user.role !== requiredRole) {
    if (user.role === 'student') next('/student/dashboard')
    else if (user.role === 'faculty') next('/faculty/dashboard')
    else if (user.role === 'admin') next('/admin/dashboard')
    else next('/')
  } else {
    next()
  }
})

export default router
