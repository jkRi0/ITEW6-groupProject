<template>
  <div class="role-layout">
    <nav>
      <RouterLink to="/" class="nav-logo">CCS — CPS</RouterLink>
      <div class="nav-badge">{{ badgeText }} &nbsp;|&nbsp; v1.0</div>
      <div class="nav-actions">
        <button class="nav-bell" @click="toggleNotif" aria-label="Notifications">
          <span class="nav-bell__icon">🔔</span>
          <span v-if="unreadCount > 0" class="nav-bell__badge">{{ unreadCount }}</span>
        </button>
        <button @click="handleLogout" class="nav-ready">LOGOUT</button>
      </div>
    </nav>

    <div v-if="notifOpen" class="notif">
      <div class="notif__backdrop" @click="notifOpen = false"></div>
      <div class="notif__panel">
        <div class="notif__title">Notifications</div>
        <div v-if="notifLoading" class="notif__hint">Loading…</div>
        <div v-else-if="notifError" class="notif__hint notif__hint--error">{{ notifError }}</div>
        <div v-else-if="notifications.length === 0" class="notif__hint">No notifications.</div>
        <button
          v-for="n in notifications"
          :key="n.id"
          class="notif__item"
          @click="markRead(n)"
        >
          <div class="notif__itemTitle">
            <span v-if="Number(n.is_read) === 0" class="notif__dot"></span>
            {{ n.title }}
          </div>
          <div class="notif__itemMeta">{{ n.created_at }}</div>
        </button>
      </div>
    </div>

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
import { computed, onMounted, ref } from 'vue';
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

const notifOpen = ref(false);
const notifLoading = ref(false);
const notifError = ref('');
const unreadCount = ref(0);
const notifications = ref([]);

function getToken() {
  return localStorage.getItem('token') || '';
}

async function apiGet(path) {
  const res = await fetch(`http://localhost:5000/api${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Request failed');
  return data;
}

async function apiPost(path, body) {
  const res = await fetch(`http://localhost:5000/api${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Request failed');
  return data;
}

async function refreshUnread() {
  try {
    const data = await apiGet('/notifications/unread-count');
    unreadCount.value = data.unread || 0;
  } catch {
  }
}

async function loadNotifications() {
  try {
    notifLoading.value = true;
    notifError.value = '';
    const data = await apiGet('/notifications/my');
    notifications.value = data.items || [];
  } catch (e) {
    notifError.value = e?.message || 'Failed to load notifications';
    notifications.value = [];
  } finally {
    notifLoading.value = false;
  }
}

async function toggleNotif() {
  notifOpen.value = !notifOpen.value;
  if (notifOpen.value) {
    await loadNotifications();
    await refreshUnread();
  }
}

async function markRead(n) {
  try {
    if (Number(n.is_read) === 0) {
      await apiPost(`/notifications/${n.id}/read`);
    }
    notifOpen.value = false;
    await refreshUnread();
  } catch {
    notifOpen.value = false;
  }
}

const handleLogout = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

onMounted(refreshUnread);
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

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-bell {
  position: relative;
  background: none;
  border: 1px solid rgba(255, 107, 26, 0.35);
  color: rgba(255, 107, 26, 0.9);
  width: 38px;
  height: 34px;
  cursor: pointer;
}

.nav-bell__icon {
  font-size: 16px;
}

.nav-bell__badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--orange);
  color: #0b0b0b;
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.notif {
  position: fixed;
  inset: 0;
  z-index: 60;
}

.notif__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

.notif__panel {
  position: absolute;
  top: 86px;
  right: 18px;
  width: min(420px, calc(100% - 24px));
  border: 1px solid rgba(255, 107, 26, 0.18);
  background: rgba(26, 26, 26, 0.92);
  padding: 12px;
}

.notif__title {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 107, 26, 0.85);
  margin-bottom: 10px;
}

.notif__hint {
  color: rgba(245, 245, 240, 0.55);
  font-size: 12px;
  padding: 6px 0;
}

.notif__hint--error {
  color: rgba(255, 80, 80, 0.85);
}

.notif__item {
  width: 100%;
  text-align: left;
  background: none;
  border: 1px solid rgba(255, 107, 26, 0.12);
  padding: 10px;
  margin-top: 8px;
  cursor: pointer;
}

.notif__itemTitle {
  color: var(--white);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notif__itemMeta {
  margin-top: 4px;
  color: rgba(245, 245, 240, 0.45);
  font-size: 12px;
}

.notif__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--orange);
  display: inline-block;
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
