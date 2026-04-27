<template>
  <div class="page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <main class="page__content">
      <div class="page__kicker">STUDENT</div>
      <h2 class="page__title">Dashboard</h2>
      <p class="page__desc">Quick view of classes, schedule, notifications, and stats.</p>

      <div v-if="error" class="banner banner--error">{{ error }}</div>
      <div v-else-if="loading" class="banner">Loading dashboard…</div>

      <div class="grid">
        <section class="card">
          <div class="card__title">Current Classes</div>
          <div v-if="!loading && classes.length === 0" class="empty">No classes found.</div>
          <div class="card__item" v-for="c in classes" :key="c.enrollment_id">
            <div class="card__itemTitle">{{ c.course_code }} — {{ c.course_title }}</div>
            <div class="card__itemMeta">{{ c.section_name }} · {{ formatMeeting(c) }}</div>
          </div>
        </section>

        <section class="card">
          <div class="card__title">Today’s Schedule</div>
          <div v-if="!loading && todaySchedule.length === 0" class="empty">No schedule entries.</div>
          <div class="card__item" v-for="s in todaySchedule" :key="s.key">
            <div class="card__itemTitle">{{ s.time }}</div>
            <div class="card__itemMeta">{{ s.detail }}</div>
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

        <section class="card">
          <div class="card__title">Quick Stats</div>
          <div class="stats">
            <div class="stat">
              <div class="stat__label">Skills</div>
              <div class="stat__value">{{ stats.skills }}</div>
            </div>
            <div class="stat">
              <div class="stat__label">Achievements</div>
              <div class="stat__value">{{ stats.achievements }}</div>
            </div>
            <div class="stat">
              <div class="stat__label">GPA</div>
              <div class="stat__value">{{ stats.gpa }}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

const loading = ref(true);
const error = ref('');

const classes = ref([]);
const notifications = ref([]);
const stats = ref({ skills: 0, achievements: 0, gpa: '—' });

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

const todaySchedule = computed(() => {
  return (classes.value || [])
    .filter((c) => c.start_time && (c.room || c.lab))
    .slice(0, 6)
    .map((c, idx) => ({
      key: `${c.enrollment_id}-${idx}`,
      time: c.start_time,
      detail: `${c.course_code} · ${(c.room || c.lab)}`
    }));
});

onMounted(async () => {
  try {
    loading.value = true;
    error.value = '';

    const [classesRes, notifRes, summaryRes] = await Promise.all([
      apiGet('/academics/student/classes'),
      apiGet('/notifications/my'),
      apiGet('/skills/student/summary')
    ]);

    classes.value = classesRes.items || [];
    notifications.value = notifRes.items || [];
    stats.value = {
      skills: summaryRes?.counts?.skills || 0,
      achievements: summaryRes?.counts?.achievements || 0,
      gpa: '—'
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
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 14px;
  transition: all 0.3s;
}

.card__title {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--orange);
  margin-bottom: 12px;
  opacity: 0.8;
}

.card__item {
  padding: 12px 0;
  border-top: 1px solid var(--card-border);
}

.card__item:first-of-type {
  border-top: none;
  padding-top: 0;
}

.card__itemTitle {
  color: var(--text-color);
  font-size: 14px;
  margin-bottom: 4px;
  opacity: 0.9;
}

.card__itemMeta {
  color: var(--dim-text);
  font-family: 'Space Mono', monospace;
  font-size: 11px;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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
  color: var(--dim-text);
}

.stat__value {
  margin-top: 8px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 32px;
  letter-spacing: 2px;
  color: var(--text-color);
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
