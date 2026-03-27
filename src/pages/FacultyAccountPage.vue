<template>
  <div class="account-page">
    <nav>
      <RouterLink to="/" class="nav-logo">CCS — CPS</RouterLink>
      <div class="nav-badge">Faculty Portal &nbsp;|&nbsp; v1.0</div>
      <button @click="handleLogout" class="nav-ready">LOGOUT</button>
    </nav>

    <div class="content-wrapper">
      <header class="page-header">
        <h1>FACULTY ACCOUNT</h1>
        <p>Welcome back, Prof. {{ user.fullName }}</p>
      </header>

      <div class="account-grid">
        <div class="profile-card">
          <h3>Faculty Profile</h3>
          <div class="info-group">
            <label>Full Name</label>
            <p>{{ user.fullName }}</p>
          </div>
          <div class="info-group">
            <label>Work Email</label>
            <p>{{ user.email }}</p>
          </div>
          <div class="info-group">
            <label>Account Type</label>
            <p class="role-badge">Faculty</p>
          </div>
        </div>

        <div class="quick-actions">
          <h3>Administrative Tools</h3>
          <div class="action-buttons">
            <RouterLink to="/faculty" class="action-btn">
              <span>Faculty Directory</span>
            </RouterLink>
            <RouterLink to="/instruction" class="action-btn">
              <span>Curriculum Mgmt</span>
            </RouterLink>
            <RouterLink to="/search-filter" class="action-btn">
              <span>Advanced Search</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <div class="status-bar status-bar--static">
      <span><span class="status-dot"></span>SYSTEM READY</span>
      <span class="status-bar__right">CCS — COMPREHENSIVE PROFILING SYSTEM</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));

const handleLogout = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

onMounted(() => {
  if (!user.value || user.value.role !== 'faculty') {
    // router.push('/login');
  }
});
</script>

<style scoped>
.account-page {
  min-height: 100vh;
  padding-top: 100px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 48px;
}

.page-header h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 48px;
  letter-spacing: 4px;
  color: var(--white);
  margin-bottom: 8px;
}

.page-header p {
  font-family: 'Space Mono', monospace;
  color: var(--orange);
  letter-spacing: 1px;
}

.account-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 32px;
}

.profile-card, .quick-actions {
  background: var(--gray);
  border: 1px solid rgba(255, 107, 26, 0.1);
  padding: 32px;
  position: relative;
}

.profile-card h3, .quick-actions h3 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 24px;
  letter-spacing: 2px;
  margin-bottom: 24px;
  color: var(--white);
}

.info-group {
  margin-bottom: 20px;
}

.info-group label {
  display: block;
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  color: var(--orange);
  margin-bottom: 4px;
}

.info-group p {
  font-size: 16px;
  color: var(--white);
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(255, 107, 26, 0.1);
  border: 1px solid var(--orange);
  font-size: 12px !important;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 107, 26, 0.2);
  padding: 24px;
  text-decoration: none;
  color: var(--white);
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  text-align: center;
  transition: all 0.3s;
}

.action-btn:hover {
  background: rgba(255, 107, 26, 0.1);
  border-color: var(--orange);
  transform: translateY(-2px);
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

@media (max-width: 768px) {
  .account-grid {
    grid-template-columns: 1fr;
  }
}
</style>
