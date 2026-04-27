<template>
  <div class="page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <main class="page__content">
      <div class="page__kicker">ADMIN</div>
      <h2 class="page__title">Users</h2>
      <p class="page__desc">Click a user to view details (dynamic route).</p>

      <div v-if="error" class="banner banner--error">{{ error }}</div>
      <div v-else-if="loading" class="banner">Loading…</div>

      <div class="toolbar">
        <input class="toolbar__search" placeholder="Search users" v-model="search" />
        <RouterLink class="btn btn--ghost" to="/admin/users/manage">Manage (CRUD)</RouterLink>
      </div>

      <UserList :users="filtered" @select="goToDetails" />

      <div v-if="!loading && filtered.length === 0" class="empty">No users found.</div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import UserList from '../components/UserList.vue';

const router = useRouter();

const loading = ref(true);
const error = ref('');
const users = ref([]);

const search = ref('');

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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Request failed');
  return data;
}

const filtered = computed(() => {
  const q = (search.value || '').trim().toLowerCase();
  if (!q) return users.value;
  return users.value.filter((u) => {
    return [u.full_name, u.email, u.role, u.id].some((v) => String(v ?? '').toLowerCase().includes(q));
  });
});

function goToDetails(user) {
  router.push(`/admin/users/${user.id}`);
}

onMounted(async () => {
  try {
    loading.value = true;
    error.value = '';
    const data = await apiGet('/admin/users');
    users.value = data.items || [];
  } catch (e) {
    error.value = e?.message || 'Failed to load users';
    users.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
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

.toolbar {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  align-items: center;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 12px 14px;
}

.toolbar__search {
  flex: 1;
  background: var(--input-bg);
  border: 1px solid var(--card-border);
  padding: 10px 12px;
  color: var(--text-color);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
}

.toolbar__search:focus {
  border-color: var(--orange);
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
}

.btn:hover {
  background: var(--orange);
  color: #fff;
  transform: translateY(-1px);
}

.btn--ghost {
  background: transparent;
}

.btn--ghost:hover {
  background: rgba(255, 107, 26, 0.08);
}

.tableWrap {
  margin-top: 14px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  overflow: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  text-align: left;
  padding: 12px 14px;
  border-bottom: 1px solid var(--card-border);
  font-size: 13px;
  color: var(--text-color);
  background: var(--card-bg);
}

.table th {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--orange);
  background: var(--panel-bg);
}

.table tr:hover td {
  background: var(--panel-bg);
}

.pill {
  display: inline-block;
  padding: 2px 8px;
  font-size: 10px;
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid var(--card-border);
  background: var(--panel-bg);
  color: var(--dim-text);
}

.empty {
  margin-top: 14px;
  color: var(--dim-text);
  font-size: 12px;
}

@media (max-width: 700px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar__search {
    min-width: 0;
    width: 100%;
  }
}
</style>
