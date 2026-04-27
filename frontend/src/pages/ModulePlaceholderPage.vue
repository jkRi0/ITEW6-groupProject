<template>
  <div class="page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <main class="page__content">
      <div class="page__kicker">{{ kicker }}</div>
      <h2 class="page__title">{{ title }}</h2>
      <p class="page__desc">{{ description }}</p>

      <div v-if="error" class="banner banner--error">{{ error }}</div>
      <div v-else-if="loading" class="banner">Loading…</div>

      <div v-if="showFilters" class="filters">
        <div class="filters__title">Filters</div>
        <div class="filters__grid">
          <input class="filters__input" placeholder="Search keyword..." v-model="search" />
          
          <!-- Dynamic Filter A -->
          <select class="filters__input" v-model="filterA">
            <option value="">{{ filterALabel }}</option>
            <option v-for="opt in filterAOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <!-- Dynamic Filter B -->
          <select class="filters__input" v-model="filterB">
            <option value="">{{ filterBLabel }}</option>
            <option v-for="opt in filterBOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
      </div>

      <div v-if="apiPath" class="results">
        <div v-if="!loading && filteredItems.length === 0" class="empty">No records.</div>

        <div v-if="filteredItems.length > 0" class="tableWrap">
          <table class="table">
            <thead>
              <tr>
                <th v-for="col in columns" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in filteredItems" :key="row.id || idx">
                <td v-for="col in columns" :key="col">{{ row[col] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="placeholder">
        <div class="placeholder__badge">NO BACKEND DATA YET</div>
        <div class="placeholder__text">
          This page is scaffolded for navigation and layout.
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const title = computed(() => route.meta.title || 'Module');
const description = computed(() => route.meta.description || '');
const kicker = computed(() => route.meta.kicker || 'MODULE');
const showFilters = computed(() => Boolean(route.meta.showFilters));
const apiPath = computed(() => route.meta.apiPath || '');

const search = ref('');
const filterA = ref('');
const filterB = ref('');

const loading = ref(false);
const error = ref('');
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
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Request failed');
  }
  return data;
}

async function load() {
  if (!apiPath.value) return;
  try {
    loading.value = true;
    error.value = '';
    const data = await apiGet(apiPath.value);
    items.value = data.items || [];
  } catch (e) {
    error.value = e?.message || 'Failed to load data';
    items.value = [];
  } finally {
    loading.value = false;
  }
}

const filterALabel = computed(() => {
  const t = title.value;
  if (t.includes('Achievements')) return 'All Categories';
  if (t.includes('Leadership') || t.includes('Affiliations')) return 'All Status';
  if (t.includes('Events')) return 'All Types';
  if (t.includes('Sports')) return 'All Roles';
  if (t.includes('Sections') || t.includes('Classes')) return 'All Academic Years';
  if (t.includes('Student Search') || t.includes('Student Profile')) return 'All Status';
  if (t.includes('Grades') || t.includes('Records')) return 'All Status';
  if (t.includes('Violations')) return 'All Types';
  return 'Filter A';
});

const filterBLabel = computed(() => {
  const t = title.value;
  if (t.includes('Achievements')) return 'All Awards';
  if (t.includes('Leadership') || t.includes('Affiliations')) return 'All Positions';
  if (t.includes('Events')) return 'All Organizers';
  if (t.includes('Sports')) return 'All Teams';
  if (t.includes('Sections') || t.includes('Classes')) return 'All Terms';
  if (t.includes('Student Search') || t.includes('Student Profile')) return 'All Sections';
  if (t.includes('Grades') || t.includes('Records')) return 'All Courses';
  if (t.includes('Violations')) return 'All Status';
  return 'Filter B';
});

const filterAOptions = computed(() => {
  const t = title.value;
  const key = t.includes('Achievements') ? 'category' : 
              (t.includes('Leadership') || t.includes('Affiliations')) ? 'status' :
              t.includes('Events') ? 'event_type' : 
              t.includes('Sports') ? 'role' : 
              (t.includes('Sections') || t.includes('Classes')) ? 'academic_year' :
              (t.includes('Student Search') || t.includes('Student Profile')) ? 'academic_status' :
              (t.includes('Grades') || t.includes('Records')) ? 'status' :
              t.includes('Violations') ? 'violation_type' : null;
  if (!key) return [];
  const set = new Set(items.value.map(i => i[key]).filter(Boolean));
  return Array.from(set).sort();
});

const filterBOptions = computed(() => {
  const t = title.value;
  const key = t.includes('Achievements') ? 'award' : 
              (t.includes('Leadership') || t.includes('Affiliations')) ? 'position' :
              t.includes('Events') ? 'organizer' : 
              t.includes('Sports') ? 'team_name' : 
              (t.includes('Sections') || t.includes('Classes')) ? 'term' :
              (t.includes('Student Search') || t.includes('Student Profile')) ? 'section_name' :
              (t.includes('Grades') || t.includes('Records')) ? 'course_code' :
              t.includes('Violations') ? 'status' : null;
  if (!key) return [];
  const set = new Set(items.value.map(i => i[key]).filter(Boolean));
  return Array.from(set).sort();
});

const columns = computed(() => {
  if (Array.isArray(items.value) && items.value.length > 0) {
    const t = title.value;
    // Priority columns for different modules
    if (t.includes('Achievements')) {
      return ['title', 'issuer', 'date_awarded', 'level', 'description'];
    }
    if (t.includes('Leadership')) {
      return ['organization_name', 'position', 'term_start', 'term_end', 'status'];
    }
    if (t.includes('Sports')) {
      return ['activity_name', 'role', 'team_name', 'academic_year', 'participation_level'];
    }
    if (t.includes('Events')) {
      return ['title', 'event_type', 'organizer', 'event_date', 'venue'];
    }
    if (t.includes('Sections') || t.includes('Classes')) {
      return ['course_code', 'course_title', 'section_name', 'academic_year', 'term'];
    }
    if (t.includes('Student Search') || t.includes('Student Profile')) {
      return ['student_number', 'first_name', 'last_name', 'section_name', 'academic_status'];
    }
    if (t.includes('Grades') || t.includes('Records')) {
      return ['student_number', 'last_name', 'course_code', 'final_grade', 'status', 'academic_year'];
    }
    if (t.includes('Materials')) {
      return ['course_code', 'course_title', 'syllabus', 'curriculum'];
    }
    if (t.includes('Violations')) {
      return ['student_number', 'last_name', 'violation_type', 'date_reported', 'status'];
    }
    if (t.includes('Affiliations')) {
      return ['title', 'issuer', 'date_awarded', 'level', 'organization_name', 'designation'];
    }
    return Object.keys(items.value[0]).filter(k => !k.toLowerCase().includes('id')).slice(0, 8);
  }
  return ['id'];
});

const filteredItems = computed(() => {
  let out = Array.isArray(items.value) ? items.value : [];

  const q = (search.value || '').trim().toLowerCase();
  if (q) {
    out = out.filter((row) => {
      return Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q));
    });
  }

  // Smart filters based on title/module
  if (filterA.value) {
    const fA = filterA.value.toLowerCase();
    out = out.filter((row) => {
      const val = (row.category || row.status || row.event_type || row.academic_year || row.academic_status || row.violation_type || '').toLowerCase();
      return String(val).includes(fA);
    });
  }
  if (filterB.value) {
    const fB = filterB.value.toLowerCase();
    out = out.filter((row) => {
      const val = (row.award || row.position || row.role || row.organizer || row.term || row.section_name || row.course_code || '').toLowerCase();
      return String(val).includes(fB);
    });
  }

  return out;
});

onMounted(load);
watch(() => apiPath.value, load);
</script>

<style scoped>
.filters {
  margin-top: 18px;
  margin-bottom: 18px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 14px;
}

.filters__title {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--orange);
  margin-bottom: 12px;
}

.filters__grid {
  display: grid;
  grid-template-columns: 1fr 200px 200px;
  gap: 10px;
}

.filters__input {
  background: var(--input-bg);
  border: 1px solid var(--card-border);
  padding: 12px;
  color: var(--text-color);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
}

.banner {
  margin-top: 14px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 12px 14px;
  color: var(--dim-text);
  font-size: 13px;
}

.banner--error {
  border-color: rgba(255, 80, 80, 0.35);
  background: rgba(255, 80, 80, 0.08);
}

.results {
  margin-top: 18px;
}

.tableWrap {
  overflow: auto;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

.table th,
.table td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--card-border);
  color: var(--text-color);
  font-size: 12px;
  opacity: 0.8;
}

.table th {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--orange);
  background: var(--panel-bg);
}

.empty {
  color: var(--dim-text);
  font-size: 12px;
  padding: 8px 0;
}

.placeholder {
  margin-top: 18px;
  border: 1px solid var(--card-border);
  background: var(--panel-bg);
  padding: 18px;
}

.placeholder__badge {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--orange);
  margin-bottom: 8px;
}

.placeholder__text {
  color: var(--dim-text);
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .filters__grid {
    grid-template-columns: 1fr;
  }
}
</style>
