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
import FacultyDashboardPage from '../pages/FacultyDashboardPage.vue'
import AdminDashboardPage from '../pages/AdminDashboardPage.vue'

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
      { path: 'profile', component: ModulePlaceholderPage, meta: { title: 'My Profile', description: 'Personal details, contact info, address, emergency contacts, and documents.', kicker: 'STUDENT' } },
      { path: 'schedule', component: ModulePlaceholderPage, meta: { title: 'My Schedule', description: 'Weekly calendar and class details (mock for now).', kicker: 'STUDENT', showFilters: true } },
      { path: 'enrollments', component: ModulePlaceholderPage, meta: { title: 'My Courses / Enrollments', description: 'Enrolled subjects and status (mock for now).', kicker: 'STUDENT', showFilters: true } },
      { path: 'academic-records', component: ModulePlaceholderPage, meta: { title: 'Academic Records', description: 'Grades by term/year and course history (mock for now).', kicker: 'STUDENT', showFilters: true } },
      { path: 'materials', component: ModulePlaceholderPage, meta: { title: 'Learning Materials', description: 'Syllabus and lessons viewer (mock for now).', kicker: 'STUDENT' } },
      { path: 'skills', component: ModulePlaceholderPage, meta: { title: 'Skills Profile', description: 'Skills list and evidence links (mock for now).', kicker: 'STUDENT', showFilters: true, apiPath: '/skills/student/list' } },
      { path: 'achievements', component: ModulePlaceholderPage, meta: { title: 'Achievements', description: 'Awards and achievements (mock for now).', kicker: 'STUDENT', showFilters: true, apiPath: '/achievements/student/list' } },
      { path: 'leadership', component: ModulePlaceholderPage, meta: { title: 'Leadership & Organizations', description: 'Organizations and roles timeline (mock for now).', kicker: 'STUDENT', showFilters: true } },
      { path: 'sports', component: ModulePlaceholderPage, meta: { title: 'Sports & Activities', description: 'Sports participation and roles (mock for now).', kicker: 'STUDENT', showFilters: true } },
      { path: 'events', component: ModulePlaceholderPage, meta: { title: 'Events / Trainings', description: 'Available and joined events (mock for now).', kicker: 'STUDENT', showFilters: true } },
      { path: 'advising-notes', component: ModulePlaceholderPage, meta: { title: 'Advising Notes', description: 'Read-only notes and feedback (mock for now).', kicker: 'STUDENT' } },
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
      { path: 'profile', component: ModulePlaceholderPage, meta: { title: 'My Profile', description: 'Personal info, expertise/background, and documents (mock for now).', kicker: 'FACULTY' } },
      { path: 'classes', component: ModulePlaceholderPage, meta: { title: 'My Classes / Sections', description: 'Assigned sections list with filters (mock for now).', kicker: 'FACULTY', showFilters: true } },
      { path: 'roster', component: ModulePlaceholderPage, meta: { title: 'Class Roster', description: 'Student list per section with search and filters (mock for now).', kicker: 'FACULTY', showFilters: true } },
      { path: 'student-profile', component: ModulePlaceholderPage, meta: { title: 'Student Profile (Restricted)', description: 'Limited student view (mock for now).', kicker: 'FACULTY', showFilters: true } },
      { path: 'academic-records', component: ModulePlaceholderPage, meta: { title: 'Academic Records Management', description: 'Encode grades and update statuses (mock for now).', kicker: 'FACULTY', showFilters: true } },
      { path: 'materials', component: ModulePlaceholderPage, meta: { title: 'Teaching Materials', description: 'Upload/edit syllabus and manage lessons (mock for now).', kicker: 'FACULTY' } },
      { path: 'advising-notes', component: ModulePlaceholderPage, meta: { title: 'Advising Notes', description: 'Add note and view history (mock for now).', kicker: 'FACULTY', showFilters: true } },
      { path: 'events', component: ModulePlaceholderPage, meta: { title: 'Events Participation', description: 'Track student participation (mock for now).', kicker: 'FACULTY', showFilters: true } },
      { path: 'violations', component: ModulePlaceholderPage, meta: { title: 'Violations', description: 'Limited access for handled students (mock for now).', kicker: 'FACULTY', showFilters: true } },
      { path: 'affiliations', component: ModulePlaceholderPage, meta: { title: 'Achievements & Leadership', description: 'Faculty achievements and org roles (mock for now).', kicker: 'FACULTY', showFilters: true } },
      { path: 'notifications', component: ModulePlaceholderPage, meta: { title: 'Notifications', description: 'Read/unread notifications (mock for now).', kicker: 'FACULTY', showFilters: true } }
    ]
  },

  {
    path: '/admin',
    component: RoleLayout,
    meta: { requiresAuth: true, role: 'admin' },
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard', component: AdminDashboardPage },
      { path: 'users', component: ModulePlaceholderPage, meta: { title: 'User Management', description: 'Create/edit users, role assignment, password reset (mock for now).', kicker: 'ADMIN', showFilters: true } },
      { path: 'students', component: ModulePlaceholderPage, meta: { title: 'Student Management', description: 'Full student profiles and documents (mock for now).', kicker: 'ADMIN', showFilters: true, apiPath: '/admin/students' } },
      { path: 'faculty', component: ModulePlaceholderPage, meta: { title: 'Faculty Management', description: 'Faculty profiles (mock for now).', kicker: 'ADMIN', showFilters: true, apiPath: '/admin/faculty' } },
      { path: 'courses', component: ModulePlaceholderPage, meta: { title: 'Course Management', description: 'Course catalog management (mock for now).', kicker: 'ADMIN', showFilters: true } },
      { path: 'sections', component: ModulePlaceholderPage, meta: { title: 'Section Management', description: 'Sections and term structure (mock for now).', kicker: 'ADMIN', showFilters: true } },
      { path: 'schedules', component: ModulePlaceholderPage, meta: { title: 'Schedule Management', description: 'Faculty assignments and meeting times (mock for now).', kicker: 'ADMIN', showFilters: true } },
      { path: 'enrollments', component: ModulePlaceholderPage, meta: { title: 'Enrollment Management', description: 'Enrollments by section/term (mock for now).', kicker: 'ADMIN', showFilters: true } },
      { path: 'academic-records', component: ModulePlaceholderPage, meta: { title: 'Academic Records', description: 'View/edit grades with audit (mock for now).', kicker: 'ADMIN', showFilters: true } },
      { path: 'non-academic', component: ModulePlaceholderPage, meta: { title: 'Non-Academic Management', description: 'Events, achievements, participation tracking (mock for now).', kicker: 'ADMIN', showFilters: true } },
      { path: 'skills', component: ModulePlaceholderPage, meta: { title: 'Skills Management', description: 'Skills library and standardization (mock for now).', kicker: 'ADMIN', showFilters: true } },
      { path: 'affiliations', component: ModulePlaceholderPage, meta: { title: 'Affiliation Management', description: 'Organizations and sports categories (mock for now).', kicker: 'ADMIN', showFilters: true } },
      { path: 'violations', component: ModulePlaceholderPage, meta: { title: 'Violations Management', description: 'Create records, sanctions, and status tracking (mock for now).', kicker: 'ADMIN', showFilters: true } },
      { path: 'medical', component: ModulePlaceholderPage, meta: { title: 'Medical Records', description: 'Sensitive module (mock for now).', kicker: 'ADMIN', showFilters: true } },
      { path: 'documents', component: ModulePlaceholderPage, meta: { title: 'Documents Management', description: 'Document references and uploads (mock for now).', kicker: 'ADMIN', showFilters: true } },
      { path: 'notifications', component: ModulePlaceholderPage, meta: { title: 'Notifications Management', description: 'Announcements and targeting (mock for now).', kicker: 'ADMIN', showFilters: true } },
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
