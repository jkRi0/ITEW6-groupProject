import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '../components/HomePage.vue'
import StudentInformationPage from '../pages/StudentInformationPage.vue'
import FacultyPage from '../pages/FacultyPage.vue'
import InstructionPage from '../pages/InstructionPage.vue'
import SchedulingPage from '../pages/SchedulingPage.vue'
import EventsPage from '../pages/EventsPage.vue'
import SearchFilterPage from '../pages/SearchFilterPage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/student-information', name: 'student-information', component: StudentInformationPage },
  { path: '/faculty', name: 'faculty', component: FacultyPage },
  { path: '/instruction', name: 'instruction', component: InstructionPage },
  { path: '/scheduling', name: 'scheduling', component: SchedulingPage },
  { path: '/events', name: 'events', component: EventsPage },
  { path: '/search-filter', name: 'search-filter', component: SearchFilterPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
