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
        <div class="filters__title">Filters (UI stub)</div>
        <div class="filters__grid">
          <input class="filters__input" placeholder="Search" v-model="search" />
          <select class="filters__input" v-model="filterA">
            <option value="">Filter A</option>
            <option value="one">One</option>
            <option value="two">Two</option>
          </select>
          <select class="filters__input" v-model="filterB">
            <option value="">Filter B</option>
            <option value="x">X</option>
            <option value="y">Y</option>
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

const columns = computed(() => {
  if (Array.isArray(items.value) && items.value.length > 0) {
    return Object.keys(items.value[0]).slice(0, 8);
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

  if (filterA.value) {
    out = out.filter((row) => String(row.filterA || row.status || '').toLowerCase().includes(filterA.value));
  }
  if (filterB.value) {
    out = out.filter((row) => String(row.filterB || row.level || '').toLowerCase().includes(filterB.value));
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
  border: 1px solid rgba(255, 107, 26, 0.12);
  background: rgba(26, 26, 26, 0.55);
  padding: 14px;
}

.filters__title {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 107, 26, 0.85);
  margin-bottom: 12px;
}

.filters__grid {
  display: grid;
  grid-template-columns: 1fr 200px 200px;
  gap: 10px;
}

.filters__input {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 107, 26, 0.1);
  padding: 12px;
  color: var(--white);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
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

.results {
  margin-top: 18px;
}

.tableWrap {
  overflow: auto;
  border: 1px solid rgba(255, 107, 26, 0.12);
  background: rgba(26, 26, 26, 0.55);
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
  border-bottom: 1px solid rgba(255, 107, 26, 0.08);
  color: rgba(245, 245, 240, 0.65);
  font-size: 12px;
}

.table th {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255, 107, 26, 0.85);
  background: rgba(255, 255, 255, 0.02);
}

.empty {
  color: rgba(245, 245, 240, 0.45);
  font-size: 12px;
  padding: 8px 0;
}

.placeholder {
  margin-top: 18px;
  border: 1px solid rgba(255, 107, 26, 0.12);
  background: rgba(255, 107, 26, 0.05);
  padding: 18px;
}

.placeholder__badge {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 107, 26, 0.85);
  margin-bottom: 8px;
}

.placeholder__text {
  color: rgba(245, 245, 240, 0.6);
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .filters__grid {
    grid-template-columns: 1fr;
  }
}
</style>
