<template>
  <div class="page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <main class="page__content">
      <div class="page__kicker">STUDENT</div>
      <h2 class="page__title">My Schedule</h2>
      <p class="page__desc">Your enrolled classes and meeting details.</p>

      <div v-if="error" class="banner banner--error">{{ error }}</div>
      <div v-else-if="loading" class="banner">Loading schedule…</div>

      <div class="toolbar">
        <input class="toolbar__search" placeholder="Search course, section, room…" v-model="q" />
        <button class="btn btn--ghost" type="button" :disabled="loading" @click="refresh">Refresh</button>
      </div>

      <div v-if="!loading && filtered.length === 0" class="empty">No schedule entries found.</div>

      <div v-if="filtered.length > 0" class="grid">
        <section v-for="d in days" :key="d.key" class="card">
          <div class="card__title">{{ d.label }}</div>

          <div v-if="d.items.length === 0" class="empty empty--small">—</div>

          <div v-for="(row, idx) in d.items" :key="`${row.enrollment_id}-${idx}`" class="item">
            <div class="item__top">
              <div class="item__name">{{ row.course_code }} — {{ row.course_title }}</div>
              <div class="item__time">{{ formatTime(row) }}</div>
            </div>
            <div class="item__meta">
              <span class="chip">{{ row.section_name }}</span>
              <span v-if="row.room" class="chip">Room {{ row.room }}</span>
              <span v-if="row.lab" class="chip">{{ row.lab }}</span>
              <span v-if="row.academic_year || row.term" class="chip">{{ [row.academic_year, row.term].filter(Boolean).join(' · ') }}</span>
            </div>
          </div>
        </section>

        <section class="card card--span" v-if="unscheduled.length > 0">
          <div class="card__title">Unscheduled / TBA</div>
          <div v-for="(row, idx) in unscheduled" :key="`${row.enrollment_id}-u-${idx}`" class="item">
            <div class="item__top">
              <div class="item__name">{{ row.course_code }} — {{ row.course_title }}</div>
              <div class="item__time">{{ formatTime(row) }}</div>
            </div>
            <div class="item__meta">
              <span class="chip">{{ row.section_name }}</span>
              <span v-if="row.room" class="chip">Room {{ row.room }}</span>
              <span v-if="row.lab" class="chip">{{ row.lab }}</span>
              <span v-if="row.days_of_week" class="chip">{{ row.days_of_week }}</span>
              <span v-if="row.academic_year || row.term" class="chip">{{ [row.academic_year, row.term].filter(Boolean).join(' · ') }}</span>
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
const q = ref('');

const items = ref([]);

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

function normalizeDayToken(s) {
  const t = String(s || '').trim().toLowerCase();
  if (!t) return '';
  if (t.startsWith('mon')) return 'mon';
  if (t.startsWith('tue')) return 'tue';
  if (t.startsWith('wed')) return 'wed';
  if (t.startsWith('thu')) return 'thu';
  if (t.startsWith('fri')) return 'fri';
  if (t.startsWith('sat')) return 'sat';
  if (t.startsWith('sun')) return 'sun';
  return '';
}

function parseDayTokens(daysOfWeek) {
  const raw = String(daysOfWeek || '').trim();
  if (!raw) return [];

  const lower = raw.toLowerCase();

  const out = [];

  const wordMatches = lower.match(/mon(day)?|tue(sday)?|wed(nesday)?|thu(rsday)?|fri(day)?|sat(urday)?|sun(day)?/g) || [];
  for (const m of wordMatches) {
    const n = normalizeDayToken(m);
    if (n) out.push(n);
  }

  if (out.length === 0) {
    const compact = lower.replace(/[^a-z]/g, '');

    if (compact.includes('mwf')) out.push('mon', 'wed', 'fri');
    if (compact.includes('tth') || compact.includes('tthu')) out.push('tue', 'thu');

    for (let i = 0; i < compact.length; i++) {
      const c = compact[i];
      const next = compact[i + 1];

      if (c === 'm') out.push('mon');
      if (c === 't') {
        if (next === 'h') {
          out.push('thu');
          i++;
        } else {
          out.push('tue');
        }
      }
      if (c === 'w') out.push('wed');
      if (c === 'f') out.push('fri');
      if (c === 's') {
        if (next === 'u') {
          out.push('sun');
          i++;
        } else {
          out.push('sat');
        }
      }
    }
  }

  return Array.from(new Set(out));
}

function sortByTime(a, b) {
  const ta = String(a?.start_time || '');
  const tb = String(b?.start_time || '');
  return ta.localeCompare(tb);
}

function formatTime(row) {
  const st = row?.start_time;
  const et = row?.end_time;
  if (st && et) return `${st}–${et}`;
  if (st) return String(st);
  return '—';
}

async function load() {
  try {
    loading.value = true;
    error.value = '';

    const data = await apiGet('/academics/student/classes');
    items.value = data.items || [];
  } catch (e) {
    error.value = e?.message || 'Failed to load schedule';
    items.value = [];
  } finally {
    loading.value = false;
  }
}

function refresh() {
  load();
}

const filtered = computed(() => {
  const all = Array.isArray(items.value) ? items.value : [];
  const query = (q.value || '').trim().toLowerCase();
  if (!query) return all;

  return all.filter((row) => {
    const hay = [
      row.course_code,
      row.course_title,
      row.section_name,
      row.room,
      row.lab,
      row.days_of_week
    ]
      .map((v) => String(v ?? '').toLowerCase())
      .join(' ');

    return hay.includes(query);
  });
});

const dayOrder = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' }
];

const days = computed(() => {
  const grouped = Object.fromEntries(dayOrder.map((d) => [d.key, []]));

  for (const row of filtered.value) {
    const tokens = parseDayTokens(row.days_of_week);
    if (tokens.length === 0) {
      continue;
    }

    for (const t of tokens) {
      if (!grouped[t]) grouped[t] = [];
      grouped[t].push(row);
    }
  }

  for (const key of Object.keys(grouped)) {
    grouped[key].sort(sortByTime);
  }

  return dayOrder.map((d) => ({
    ...d,
    items: grouped[d.key] || []
  }));
});

const unscheduled = computed(() => {
  return (filtered.value || []).filter((row) => parseDayTokens(row.days_of_week).length === 0).sort(sortByTime);
});

onMounted(load);
</script>

<style scoped>
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

.toolbar {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.toolbar__search {
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 107, 26, 0.1);
  padding: 12px;
  color: var(--white);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
}

.toolbar__search:focus {
  border-color: rgba(255, 107, 26, 0.45);
  background: rgba(255, 107, 26, 0.05);
}

.btn {
  border: 1px solid rgba(255, 107, 26, 0.35);
  background: rgba(255, 107, 26, 0.12);
  color: rgba(245, 245, 240, 0.85);
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  padding: 10px 12px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn--ghost {
  background: transparent;
}

.grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.card--span {
  grid-column: 1 / -1;
}

.card {
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 14px;
  transition: background-color 0.3s, border-color 0.3s;
}

.card__title {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--orange);
  margin-bottom: 12px;
  opacity: 0.85;
}

.item {
  padding: 10px 0;
  border-top: 1px solid var(--card-border);
}

.item:first-of-type {
  border-top: none;
  padding-top: 0;
}

.item__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.item__name {
  color: var(--text-color);
  font-size: 13px;
  opacity: 0.85;
}

.item__time {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--dim-text);
  white-space: nowrap;
}

.item__meta {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  border: 1px solid var(--card-border);
  background: var(--panel-bg);
  color: var(--dim-text);
  padding: 6px 8px;
  font-size: 11px;
}

.empty {
  margin-top: 16px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 12px 14px;
  color: var(--dim-text);
  font-size: 13px;
}

.empty--small {
  margin-top: 0;
  background: transparent;
  border: none;
  padding: 0;
}

@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
