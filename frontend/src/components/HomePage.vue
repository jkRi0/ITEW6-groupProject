<template>
  <div>
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <nav>
      <div class="nav-logo">CCS — CPS</div>
      <div class="nav-badge">Comprehensive Profiling System &nbsp;|&nbsp; v1.0</div>
      <div class="nav-auth" v-if="!isAuthenticated">
        <RouterLink to="/login" class="nav-link">Login</RouterLink>
        <RouterLink to="/register" class="nav-link">Register</RouterLink>
      </div>
      <div class="nav-auth" v-else>
        <span class="nav-user">Welcome, {{ userName }}</span>
        <button @click="handleLogout" class="nav-link logout-btn">Logout</button>
      </div>
      <div class="nav-theme">
        <button @click="toggleTheme" class="theme-toggle" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
      </div>
      <div class="nav-ready">SYSTEM READY</div>
    </nav>

    <div class="hero">
      <div class="divider-line"></div>
      <div class="hero-number">CCS</div>

      <div class="hero-left">
        <div class="eyebrow">College of Computer Studies</div>
        <h1>COMPRE<span>HENSIVE</span></h1>
        <div class="sub-title">Profiling System</div>
        <p class="hero-desc">
          A unified platform managing student information, faculty records, instruction, scheduling, events, and
          intelligent search — all in one integrated ecosystem.
        </p>
        <div class="cta-group">
          <RouterLink v-if="isAuthenticated" class="btn-primary" to="/student-information">Access System</RouterLink>
          <RouterLink v-else class="btn-primary" to="/login">Login to Access</RouterLink>
          <a class="btn-secondary" href="#modules">View Modules</a>
        </div>
      </div>

      <div class="hero-right" id="modules">
        <div class="modules-grid">
          <RouterLink class="module-card featured" to="/student-information">
            <div class="module-icon">01 — PRIMARY</div>
            <div class="module-name">Student Information</div>
            <div class="module-sub">Central repository for all student records, profiles, and academic history</div>
          </RouterLink>

          <RouterLink class="module-card" to="/faculty">
            <div class="module-icon">02</div>
            <div class="module-name">Faculty</div>
            <div class="module-sub">Faculty profiles & information management</div>
          </RouterLink>

          <RouterLink class="module-card" to="/instruction">
            <div class="module-icon">03</div>
            <div class="module-name">Instruction</div>
            <div class="module-sub">Syllabus · Lessons · Curriculum</div>
          </RouterLink>

          <RouterLink class="module-card" to="/scheduling">
            <div class="module-icon">04</div>
            <div class="module-name">Scheduling</div>
            <div class="module-sub">Courses · Sections · Rooms · Labs</div>
          </RouterLink>

          <RouterLink class="module-card" to="/events">
            <div class="module-icon">05</div>
            <div class="module-name">Events</div>
            <div class="module-sub">Curricular & Extra-Curricular</div>
          </RouterLink>

          <RouterLink class="module-card module-card-advanced" to="/search-filter">
            <div class="module-icon">06 — ADVANCED</div>
            <div class="module-name">Comprehensive Search / Filter</div>
            <div class="module-sub">Intelligent cross-module search and advanced filtering engine</div>
          </RouterLink>
        </div>
      </div>

      <div class="corner-tag">© CCS · 2025 · All Rights Reserved</div>
    </div>

    <div class="status-bar">
      <span><span class="status-dot"></span>SYSTEM ONLINE</span>
      <span>MODULES: 6 ACTIVE</span>
      <span>SECURE CONNECTION</span>
      <span class="status-bar__right">CCS — COMPREHENSIVE PROFILING SYSTEM</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isAuthenticated = ref(false);
const isDark = ref(true);
const userName = ref('Admin');

onMounted(() => {
  isAuthenticated.value = localStorage.getItem('isAuthenticated') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.fullName) {
    userName.value = user.fullName;
  }
  
  // Theme initialization
  const savedTheme = localStorage.getItem('theme') || 'dark';
  isDark.value = savedTheme === 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
});

const toggleTheme = () => {
  isDark.value = !isDark.value;
  const newTheme = isDark.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
};

const handleLogout = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  isAuthenticated.value = false;
  router.push('/');
};
</script>

<style scoped>
.nav-auth {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-left: auto;
}

.nav-link {
  text-decoration: none;
  color: var(--dim-text);
  font-family: 'Space Mono', monospace;
  font-size: 0.8rem;
  letter-spacing: 1px;
  transition: color 0.3s;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  text-transform: uppercase;
}

.nav-link:hover {
  color: var(--orange);
}

.nav-user {
  font-size: 0.8rem;
  color: var(--text-color);
  letter-spacing: 1px;
}

.logout-btn {
  color: #ff4444 !important;
}

.nav-theme {
  margin-left: 20px;
  margin-right: 20px;
}

.theme-toggle {
  background: var(--panel-bg);
  border: 1px solid var(--card-border);
  color: var(--text-color);
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.theme-toggle:hover {
  border-color: var(--orange);
  background: rgba(255, 107, 26, 0.1);
  transform: translateY(-2px);
}

.hero-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 140px 64px 80px;
  position: relative;
  z-index: 2;
  background: transparent;
}

.hero-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 140px 64px 80px 0;
  position: relative;
  z-index: 2;
  background: transparent;
}

.module-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  padding: 24px 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  flex-direction: column;
}

.module-card:hover {
  border-color: var(--orange);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(255, 107, 26, 0.15);
}

.module-card.featured {
  grid-column: span 2;
  background: var(--panel-bg);
  border-color: var(--orange);
}
</style>
