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

.btn {
  border: 1px solid rgba(255, 107, 26, 0.35);
  background: rgba(255, 107, 26, 0.12);
  color: rgba(245, 245, 240, 0.85);
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  padding: 10px 12px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn:hover {
  border-color: rgba(255, 107, 26, 0.55);
  background: rgba(255, 107, 26, 0.18);
  color: rgba(245, 245, 240, 0.95);
}

.btn--ghost {
  background: transparent;
}

.btn--ghost:hover {
  background: rgba(255, 107, 26, 0.08);
}

.card {
  margin-top: 14px;
  border: 1px solid rgba(255, 107, 26, 0.12);
  background: rgba(26, 26, 26, 0.55);
  padding: 14px;
}

.card__title {
  color: var(--white);
  font-family: 'Space Mono', monospace;
  font-size: 14px;
}

.meta {
  margin-top: 8px;
  color: rgba(245, 245, 240, 0.55);
  font-size: 12px;
}

@media (max-width: 700px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
