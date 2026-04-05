<template>
  <div class="page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <main class="page__content">
      <div class="page__kicker">FACULTY</div>
      <h2 class="page__title">Dashboard</h2>
      <p class="page__desc">Today’s classes, student counts, and alerts.</p>

      <div v-if="error" class="banner banner--error">{{ error }}</div>
      <div v-else-if="loading" class="banner">Loading dashboard…</div>

      <div class="grid">
        <section class="card">
          <div class="card__title">Today’s Classes</div>
          <div v-if="!loading && classes.length === 0" class="empty">No classes found.</div>
          <div class="card__item" v-for="c in classes" :key="c.schedule_id">
            <div class="card__itemTitle">{{ c.section_name }} · {{ c.course_code }}</div>
            <div class="card__itemMeta">{{ formatMeeting(c) }}</div>
          </div>
        </section>

        <section class="card">
          <div class="card__title">Stats</div>
          <div class="stats">
            <div class="stat">
              <div class="stat__label">Sections</div>
              <div class="stat__value">{{ stats.sections }}</div>
            </div>
            <div class="stat">
              <div class="stat__label">Students</div>
              <div class="stat__value">{{ stats.students }}</div>
            </div>
            <div class="stat">
              <div class="stat__label">Alerts</div>
              <div class="stat__value">{{ stats.alerts }}</div>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card__title">Notifications</div>
          <div v-if="!loading && notifications.length === 0" class="empty">No notifications.</div>
          <div class="card__item" v-for="n in notifications" :key="n.id">
            <div class="card__itemTitle">{{ n.title }}</div>
            <div class="card__itemMeta">{{ n.created_at }}</div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const loading = ref(true);
const error = ref('');

const classes = ref([]);
const notifications = ref([]);
const stats = ref({ sections: 0, students: 0, alerts: 0 });

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token') || '';
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Request failed');
  }
  return data;
}

function formatMeeting(row) {
  const parts = [];
  if (row.days_of_week) parts.push(row.days_of_week);
  if (row.start_time && row.end_time) parts.push(`${row.start_time}–${row.end_time}`);
  if (row.room) parts.push(row.room);
  if (row.lab) parts.push(row.lab);
  return parts.length > 0 ? parts.join(' · ') : '—';
}

onMounted(async () => {
  try {
    loading.value = true;
    error.value = '';

    const [todayRes, statsRes, notifRes] = await Promise.all([
      apiGet('/academics/faculty/today'),
      apiGet('/academics/faculty/stats'),
      apiGet('/notifications/my')
    ]);

    classes.value = todayRes.items || [];
    notifications.value = notifRes.items || [];
    stats.value = {
      sections: statsRes?.counts?.sections || 0,
      students: statsRes?.counts?.students || 0,
      alerts: 0
    };
  } catch (e) {
    error.value = e?.message || 'Failed to load dashboard';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.card {
  border: 1px solid rgba(255, 107, 26, 0.12);
  background: rgba(26, 26, 26, 0.55);
  padding: 14px;
}

.card__title {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 107, 26, 0.85);
  margin-bottom: 12px;
}

.card__item {
  padding: 10px 0;
  border-top: 1px solid rgba(255, 107, 26, 0.08);
}

.card__item:first-of-type {
  border-top: none;
  padding-top: 0;
}

.card__itemTitle {
  color: var(--white);
  font-size: 13px;
}

.card__itemMeta {
  color: rgba(245, 245, 240, 0.45);
  font-size: 12px;
  margin-top: 2px;
}

.banner {
  margin-top: 14px;
  border: 1px solid rgba(255, 107, 26, 0.12);
  background: rgba(26, 26, 26, 0.55);
  padding: 12px 14px;
  color: rgba(245, 245, 240, 0.65);
  font-size: 13px;
}

.banner--error {
  border-color: rgba(255, 80, 80, 0.35);
  background: rgba(255, 80, 80, 0.08);
}

.empty {
  color: rgba(245, 245, 240, 0.45);
  font-size: 12px;
  padding: 8px 0;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat {
  border: 1px solid rgba(255, 107, 26, 0.1);
  background: rgba(255, 255, 255, 0.02);
  padding: 12px;
}

.stat__label {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(245, 245, 240, 0.45);
}

.stat__value {
  margin-top: 8px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 32px;
  letter-spacing: 2px;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
