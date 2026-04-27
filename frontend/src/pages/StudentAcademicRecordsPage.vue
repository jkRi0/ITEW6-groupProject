<template>
  <div class="page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <main class="page__content">
      <div class="page__kicker">STUDENT</div>
      <h2 class="page__title">Academic Records</h2>
      <p class="page__desc">Full history of your courses, grades, and academic standing.</p>

      <div v-if="error" class="banner banner--error">{{ error }}</div>
      <div v-else-if="loading" class="banner">Loading academic records…</div>

      <div class="toolbar">
        <input class="toolbar__search" placeholder="Search course, grade, status…" v-model="q" />
        <select class="toolbar__select" v-model="year">
          <option value="">All years</option>
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
        <select class="toolbar__select" v-model="term">
          <option value="">All terms</option>
          <option v-for="t in termOptions" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <div v-if="!loading && filtered.length === 0" class="empty">No academic records found.</div>

      <div v-if="filtered.length > 0" class="records">
        <div v-for="group in groupedRecords" :key="group.key" class="group">
          <div class="group__header">
            <h3 class="group__title">{{ group.year }} · {{ group.term }}</h3>
            <div class="group__stats">
              <span class="chip chip--orange">{{ group.items.length }} Subjects</span>
              <span class="chip chip--dim" v-if="group.gpa !== 'N/A'">GPA: {{ group.gpa }}</span>
            </div>
          </div>

          <div class="tableWrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Title</th>
                  <th>Units</th>
                  <th>Status</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in group.items" :key="row.id">
                  <td class="mono">{{ row.course_code }}</td>
                  <td>{{ row.course_title }}</td>
                  <td class="mono">{{ row.units }}</td>
                  <td>
                    <span class="pill pill--status" :class="statusClass(row.status)">{{ row.status }}</span>
                  </td>
                  <td class="mono grade-cell">
                    <span :class="gradeClass(row.final_grade)">{{ row.final_grade || '—' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
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

async function load() {
  try {
    loading.value = true;
    error.value = '';
    const data = await apiGet('/student/academic-records');
    items.value = data.items || [];
  } catch (e) {
    error.value = e?.message || 'Failed to load records';
    items.value = [];
  } finally {
    loading.value = false;
  }
}

const yearOptions = computed(() => {
  const set = new Set((items.value || []).map(r => r.academic_year).filter(Boolean));
  return Array.from(set).sort().reverse();
});

const termOptions = computed(() => {
  const set = new Set((items.value || []).map(r => r.term).filter(Boolean));
  return Array.from(set).sort();
});

const filtered = computed(() => {
  let out = Array.isArray(items.value) ? items.value : [];

  const query = (q.value || '').trim().toLowerCase();
  if (query) {
    out = out.filter(row => {
      const hay = [
        row.course_code,
        row.course_title,
        row.final_grade,
        row.status,
        row.academic_year,
        row.term
      ].map(v => String(v ?? '').toLowerCase()).join(' ');
      return hay.includes(query);
    });
  }

  if (year.value) out = out.filter(r => r.academic_year === year.value);
  if (term.value) out = out.filter(r => r.term === term.value);

  return out;
});

const groupedRecords = computed(() => {
  const groups = {};
  for (const row of filtered.value) {
    const key = `${row.academic_year}-${row.term}`;
    if (!groups[key]) {
      groups[key] = {
        key,
        year: row.academic_year,
        term: row.term,
        items: []
      };
    }
    groups[key].items.push(row);
  }

  const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
  
  return sortedKeys.map(key => {
    const group = groups[key];
    
    let totalPoints = 0;
    let totalUnits = 0;
    
    for (const item of group.items) {
      const g = parseFloat(item.final_grade);
      const u = parseFloat(item.units);
      if (!isNaN(g) && !isNaN(u)) {
        totalPoints += (g * u);
        totalUnits += u;
      }
    }
    
    group.gpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : 'N/A';
    return group;
  });
});

function gradeClass(grade) {
  const g = parseFloat(grade);
  if (isNaN(g)) return '';
  if (g >= 3.0) return 'grade--failed';
  if (g <= 1.5) return 'grade--excelent';
  return 'grade--passed';
}

function statusClass(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('passed') || s.includes('completed')) return 'pill--passed';
  if (s.includes('failed')) return 'pill--failed';
  if (s.includes('withdrawn') || s.includes('dropped')) return 'pill--dropped';
  return 'pill--ongoing';
}

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
  grid-template-columns: 1fr 200px 200px;
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
  transition: all 0.3s;
}

.records {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.group__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 107, 26, 0.2);
  padding-bottom: 8px;
}

.group__title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 24px;
  letter-spacing: 1px;
  color: var(--text-color);
}

.group__stats {
  display: flex;
  gap: 8px;
}

.chip {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  padding: 4px 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.chip--orange {
  background: rgba(255, 107, 26, 0.15);
  color: var(--orange);
  border: 1px solid rgba(255, 107, 26, 0.3);
}

.chip--dim {
  background: rgba(245, 245, 240, 0.05);
  color: rgba(245, 245, 240, 0.45);
  border: 1px solid rgba(245, 245, 240, 0.1);
}

.tableWrap {
  overflow: auto;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  transition: all 0.3s;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.table th,
.table td {
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid var(--card-border);
  color: var(--text-color);
  font-size: 13px;
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
  padding: 4px 8px;
  font-size: 10px;
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.pill--status {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.pill--passed { color: #4ade80; border-color: rgba(74, 222, 128, 0.2); background: rgba(74, 222, 128, 0.05); }
.pill--failed { color: #f87171; border-color: rgba(248, 113, 113, 0.2); background: rgba(248, 113, 113, 0.05); }
.pill--dropped { color: #94a3b8; border-color: rgba(148, 163, 184, 0.2); background: rgba(148, 163, 184, 0.05); }
.pill--ongoing { color: var(--orange); border-color: rgba(255, 107, 26, 0.2); background: rgba(255, 107, 26, 0.05); }

.grade-cell {
  font-weight: bold;
  font-size: 14px;
}

.grade--excellent { color: #4ade80; }
.grade--passed { color: var(--white); }
.grade--failed { color: #f87171; }

@media (max-width: 800px) {
  .toolbar {
    grid-template-columns: 1fr;
  }
}
</style>
