<template>
  <div class="role-layout">
    <nav>
      <RouterLink to="/" class="nav-logo">CCS — CPS</RouterLink>
      <div class="nav-badge">{{ badgeText }} &nbsp;|&nbsp; v1.0</div>
      <button @click="handleLogout" class="nav-ready">LOGOUT</button>
    </nav>

    <div class="role-layout__body">
      <SidebarNav :role="role" class="role-layout__sidebar" />
      <main class="role-layout__main">
        <RouterView />
      </main>
    </div>

    <div class="status-bar status-bar--static">
      <span><span class="status-dot"></span>SYSTEM ONLINE</span>
      <span class="status-bar__right">CCS — COMPREHENSIVE PROFILING SYSTEM</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import SidebarNav from '../components/SidebarNav.vue';

const router = useRouter();
const route = useRoute();

const role = computed(() => route.meta.role || 'student');

const badgeText = computed(() => {
  if (role.value === 'student') return 'Student Portal';
  if (role.value === 'faculty') return 'Faculty Portal';
  if (role.value === 'admin') return 'Admin Portal';
  return 'Portal';
});

const handleLogout = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};
</script>

<style scoped>
.role-layout {
  min-height: 100vh;
}

.role-layout__body {
  min-height: 100vh;
  padding-top: 96px;
  padding-bottom: 56px;
  display: grid;
  grid-template-columns: 260px 1fr;
}

.role-layout__sidebar {
  position: sticky;
  top: 96px;
  height: calc(100vh - 96px - 56px);
  border-right: 1px solid rgba(255, 107, 26, 0.12);
  background: rgba(10, 10, 10, 0.45);
  backdrop-filter: blur(10px);
}

.role-layout__main {
  min-height: calc(100vh - 96px - 56px);
}

.nav-ready {
  background: none;
  border: 1px solid var(--orange);
  color: var(--orange);
  padding: 8px 16px;
  cursor: pointer;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  transition: all 0.3s;
}

.nav-ready:hover {
  background: var(--orange);
  color: var(--white);
}

@media (max-width: 900px) {
  .role-layout__body {
    grid-template-columns: 1fr;
  }

  .role-layout__sidebar {
    position: relative;
    top: 0;
    height: auto;
  }
}
</style>
