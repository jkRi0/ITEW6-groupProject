<template>
  <div class="page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <main class="page__content">
      <div class="page__kicker">STUDENT</div>
      <h2 class="page__title">My Courses / Enrollments</h2>
      <p class="page__desc">Your enrolled subjects and enrollment status.</p>

      <div v-if="error" class="banner banner--error">{{ error }}</div>
      <div v-else-if="loading" class="banner">Loading enrollments…</div>

      <div class="toolbar">
        <input class="toolbar__search" placeholder="Search course, section, status…" v-model="q" />
        <select class="toolbar__select" v-model="year">
          <option value="">All years</option>
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
        <select class="toolbar__select" v-model="term">
          <option value="">All terms</option>
          <option v-for="t in termOptions" :key="t" :value="t">{{ t }}</option>
        </select>
        <select class="toolbar__select" v-model="status">
          <option value="">All status</option>
          <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <div v-if="!loading && filtered.length === 0" class="empty">No enrollments found.</div>

      <div v-if="filtered.length > 0" class="tableWrap">
        <table class="table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Title</th>
              <th>Section</th>
              <th>AY</th>
              <th>Term</th>
              <th>Status</th>
              <th>Meeting</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in filtered" :key="row.enrollment_id || idx">
              <td class="mono">{{ row.course_code }}</td>
              <td>{{ row.course_title }}</td>
              <td class="mono">{{ row.section_name }}</td>
              <td class="mono">{{ row.academic_year || '—' }}</td>
              <td class="mono">{{ row.term || '—' }}</td>
              <td>
                <span class="pill">{{ row.status || '—' }}</span>
              </td>
              <td class="mono">{{ formatMeeting(row) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

const loading = ref(true);
const error = ref('');

const items = ref([]);

const q = ref('');
const year = ref('');
const term = ref('');
const status = ref('');

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

  const raw = await res.text();
  const data = (() => {
    try {
      return raw ? JSON.parse(raw) : {};
    } catch {
      return { message: raw };
    }
  })();

  if (!res.ok) {
    const msg = data?.message || res.statusText || 'Request failed';
    throw new Error(`${res.status} ${msg}`.trim());
  }

  return data;
}

function formatMeeting(row) {
  const parts = [];
  if (row.days_of_week) parts.push(row.days_of_week);
  if (row.start_time && row.end_time) parts.push(`${row.start_time}–${row.end_time}`);
  if (row.room) parts.push(`Room ${row.room}`);
  if (row.lab) parts.push(row.lab);
  return parts.length > 0 ? parts.join(' · ') : '—';
}

async function load() {
  try {
    loading.value = true;
    error.value = '';

    const data = await apiGet('/academics/student/classes');
    items.value = data.items || [];
  } catch (e) {
    error.value = e?.message || 'Failed to load enrollments';
    items.value = [];
  } finally {
    loading.value = false;
  }
}

const yearOptions = computed(() => {
  const set = new Set((items.value || []).map((r) => r.academic_year).filter(Boolean));
  return Array.from(set).sort().reverse();
});

const termOptions = computed(() => {
  const set = new Set((items.value || []).map((r) => r.term).filter(Boolean));
  return Array.from(set).sort();
});

const statusOptions = computed(() => {
  const set = new Set((items.value || []).map((r) => r.status).filter(Boolean));
  return Array.from(set).sort();
});

const filtered = computed(() => {
  let out = Array.isArray(items.value) ? items.value : [];

  const query = (q.value || '').trim().toLowerCase();
  if (query) {
    out = out.filter((row) => {
      const hay = [
        row.course_code,
        row.course_title,
        row.section_name,
        row.status,
        row.academic_year,
        row.term,
        row.days_of_week,
        row.room,
        row.lab
      ]
        .map((v) => String(v ?? '').toLowerCase())
        .join(' ');
      return hay.includes(query);
    });
  }

  if (year.value) out = out.filter((r) => String(r.academic_year || '') === String(year.value));
  if (term.value) out = out.filter((r) => String(r.term || '') === String(term.value));
  if (status.value) out = out.filter((r) => String(r.status || '') === String(status.value));

  out = out.slice().sort((a, b) => {
    const ay = String(b.academic_year || '').localeCompare(String(a.academic_year || ''));
    if (ay !== 0) return ay;
    const tm = String(b.term || '').localeCompare(String(a.term || ''));
    if (tm !== 0) return tm;
    return String(a.course_code || '').localeCompare(String(b.course_code || ''));
  });

  return out;
});

onMounted(load);
</script>

<style scoped>
.banner {
  margin-top: 14px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 12px 14px;
  color: var(--dim-text);
  font-size: 13px;
  transition: all 0.3s;
}

.banner--error {
  border-color: rgba(255, 80, 80, 0.35);
  background: rgba(255, 80, 80, 0.08);
}

.toolbar {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 180px 180px 180px;
  gap: 10px;
  align-items: center;
}

.toolbar__search,
.toolbar__select {
  width: 100%;
  box-sizing: border-box;
  background: var(--input-bg);
  border: 1px solid var(--card-border);
  padding: 12px;
  color: var(--text-color);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.toolbar__search:focus,
.toolbar__select:focus {
  border-color: var(--orange);
  background: var(--panel-bg);
}

.empty {
  margin-top: 16px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 12px 14px;
  color: var(--dim-text);
  font-size: 13px;
}

.tableWrap {
  margin-top: 14px;
  overflow: auto;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  transition: all 0.3s;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 920px;
}

.table th,
.table td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--card-border);
  color: var(--text-color);
  font-size: 12px;
  opacity: 0.85;
}

.table th {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--orange);
  opacity: 0.7;
}

.mono {
  font-family: 'Space Mono', monospace;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 8px;
  border: 1px solid var(--card-border);
  background: var(--panel-bg);
  color: var(--dim-text);
}

@media (max-width: 980px) {
  .toolbar {
    grid-template-columns: 1fr;
  }
}
</style>
