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

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/login', name: 'login', component: LoginPage },
  { path: '/register', name: 'register', component: RegisterPage },
  { path: '/student-information', name: 'student-information', component: StudentInformationPage, meta: { requiresAuth: true } },
  { path: '/faculty', name: 'faculty', component: FacultyPage, meta: { requiresAuth: true } },
  { path: '/instruction', name: 'instruction', component: InstructionPage, meta: { requiresAuth: true } },
  { path: '/scheduling', name: 'scheduling', component: SchedulingPage, meta: { requiresAuth: true } },
  { path: '/events', name: 'events', component: EventsPage, meta: { requiresAuth: true } },
  { path: '/search-filter', name: 'search-filter', component: SearchFilterPage, meta: { requiresAuth: true } },
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

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
