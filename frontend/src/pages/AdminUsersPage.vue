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
  min-width: 240px;
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

.empty {
  margin-top: 14px;
  color: rgba(245, 245, 240, 0.55);
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
