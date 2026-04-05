<template>
  <div class="page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <main class="page__content">
      <div class="page__kicker">ADMIN</div>
      <h2 class="page__title">Dashboard</h2>
      <p class="page__desc">System overview and recent activity.</p>

      <div v-if="error" class="banner banner--error">{{ error }}</div>
      <div v-else-if="loading" class="banner">Loading dashboard…</div>

      <div class="grid">
        <section class="card">
          <div class="card__title">System Overview</div>
          <div class="stats">
            <div class="stat">
              <div class="stat__label">Students</div>
              <div class="stat__value">{{ stats.students }}</div>
            </div>
            <div class="stat">
              <div class="stat__label">Faculty</div>
              <div class="stat__value">{{ stats.faculty }}</div>
            </div>
            <div class="stat">
              <div class="stat__label">Sections</div>
              <div class="stat__value">{{ stats.sections }}</div>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card__title">Recent Activities</div>
          <div v-if="!loading && activity.length === 0" class="empty">No activity.</div>
          <div class="card__item" v-for="a in activity" :key="a.id">
            <div class="card__itemTitle">{{ a.action }} · {{ a.entity }}</div>
            <div class="card__itemMeta">{{ a.actor_name || 'System' }} · {{ a.created_at }}</div>
          </div>
        </section>

        <section class="card">
          <div class="card__title">Global Search (UI stub)</div>
          <input class="search" placeholder="Search students, faculty, courses..." v-model="q" />
          <div class="search__hint">Search API not implemented yet (UI only).</div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { onMounted } from 'vue';

const q = ref('');

const loading = ref(true);
const error = ref('');

const stats = ref({ students: 0, faculty: 0, sections: 0 });
const activity = ref([]);

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

onMounted(async () => {
  try {
    loading.value = true;
    error.value = '';

    const [overviewRes, activityRes] = await Promise.all([
      apiGet('/admin/overview'),
      apiGet('/admin/activity')
    ]);

    stats.value = {
      students: overviewRes?.counts?.students || 0,
      faculty: overviewRes?.counts?.faculty || 0,
      sections: overviewRes?.counts?.sections || 0
    };
    activity.value = activityRes.items || [];
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

.search {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 107, 26, 0.1);
  padding: 12px;
  color: var(--white);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
}

.search__hint {
  margin-top: 10px;
  color: rgba(245, 245, 240, 0.45);
  font-size: 12px;
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
