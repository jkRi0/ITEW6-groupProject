<template>
  <div class="page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <main class="page__content">
      <div class="page__kicker">ADMIN</div>
      <h2 class="page__title">User Details</h2>
      <p class="page__desc">Dynamic route: /admin/users/:id</p>

      <div class="toolbar">
        <RouterLink class="btn btn--ghost" to="/admin/users">← Back</RouterLink>
        <RouterLink class="btn btn--ghost" to="/admin/users/manage">Manage (CRUD)</RouterLink>
      </div>

      <div v-if="error" class="banner banner--error">{{ error }}</div>
      <div v-else-if="loading" class="banner">Loading…</div>

      <section v-else class="card">
        <div class="card__title">{{ user?.full_name }}</div>
        <div class="meta">ID: {{ user?.id }}</div>
        <div class="meta">Email: {{ user?.email }}</div>
        <div class="meta">Role: {{ user?.role }}</div>
        <div class="meta">Disabled: {{ Number(user?.is_disabled) === 1 ? 'Yes' : 'No' }}</div>
        <div class="meta">Created: {{ user?.created_at }}</div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const loading = ref(true);
const error = ref('');
const user = ref(null);

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

    const id = Number(route.params.id);
    if (!id) throw new Error('Invalid id');

    const data = await apiGet(`/admin/users/${id}`);
    user.value = data.item || null;
  } catch (e) {
    error.value = e?.message || 'Failed to load user';
    user.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => route.params.id, load);
</script>

<style scoped>
.banner {
  margin-top: 14px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 16px 20px;
}

.banner__title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 32px;
  letter-spacing: 2px;
  color: var(--text-color);
}

.banner__meta {
  margin-top: 4px;
  font-size: 13px;
  color: var(--dim-text);
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.toolbar {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  align-items: center;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 12px 14px;
}

.btn {
  border: 1px solid var(--orange);
  background: rgba(255, 107, 26, 0.1);
  color: var(--text-color);
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  padding: 10px 16px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.2s;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn:hover {
  background: var(--orange);
  color: #fff;
  transform: translateY(-1px);
}

.grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: start;
}

.card {
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 14px;
}

.card__title {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--orange);
  margin-bottom: 12px;
}

.card__row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--card-border);
}

.card__label {
  color: var(--dim-text);
  font-size: 12px;
}

.card__value {
  color: var(--text-color);
  font-size: 13px;
  text-align: right;
}

@media (max-width: 700px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
