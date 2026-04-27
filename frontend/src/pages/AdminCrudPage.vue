<template>
  <div class="page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <main class="page__content">
      <div class="page__kicker">ADMIN</div>
      <h2 class="page__title">{{ title }}</h2>
      <p class="page__desc">Manage records (create, edit, delete) using live backend data.</p>

      <div v-if="error" class="banner banner--error">{{ error }}</div>
      <div v-else-if="loading" class="banner">Loading…</div>

      <div class="toolbar">
        <input class="toolbar__search" placeholder="Search" v-model="search" />
        <button class="btn" @click="openCreate">New</button>
      </div>

      <div class="tableWrap">
        <table class="table">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col">{{ col }}</th>
              <th>actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredItems" :key="row.id">
              <td v-for="col in columns" :key="col">{{ row[col] }}</td>
              <td class="actions">
                <button class="btn btn--ghost" @click="openEdit(row)">Edit</button>
                <button
                  v-for="a in rowActions"
                  :key="a.key"
                  class="btn btn--ghost"
                  @click="runAction(a, row)"
                >
                  {{ a.label(row) }}
                </button>
                <button class="btn btn--danger" @click="remove(row)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!loading && filteredItems.length === 0" class="empty">No records.</div>

      <div v-if="showModal" class="modal">
        <div class="modal__backdrop" @click="close"></div>
        <div class="modal__panel">
          <div class="modal__title">{{ editingId ? 'Edit' : 'Create' }} {{ title }}</div>

          <div class="form">
            <div v-for="f in fields" :key="f.key" class="form__row">
              <template v-if="fieldVisible(f)">
              <label class="form__label">{{ f.label }}</label>
              <input
                v-if="f.type !== 'textarea'"
                class="form__input"
                :type="f.type || 'text'"
                v-model="draft[f.key]"
                :placeholder="f.placeholder || ''"
              />
              <textarea
                v-else
                class="form__input"
                rows="4"
                v-model="draft[f.key]"
                :placeholder="f.placeholder || ''"
              ></textarea>
              </template>
            </div>
          </div>

          <div class="modal__actions">
            <button class="btn btn--ghost" @click="close">Cancel</button>
            <button class="btn" @click="save">Save</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const config = computed(() => route.meta.crud || {});
const title = computed(() => config.value.title || 'Management');
const apiBase = computed(() => config.value.apiBase || '');
const fields = computed(() => config.value.fields || []);
const actions = computed(() => config.value.actions || []);

const loading = ref(true);
const error = ref('');
const items = ref([]);

const search = ref('');

const showModal = ref(false);
const editingId = ref(null);
const draft = ref({});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token') || '';
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Request failed');
  return data;
}

async function load() {
  if (!apiBase.value) {
    items.value = [];
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    const data = await apiFetch(apiBase.value);
    items.value = data.items || [];
  } catch (e) {
    error.value = e?.message || 'Failed to load data';
    items.value = [];
  } finally {
    loading.value = false;
  }
}

const columns = computed(() => {
  const preferred = config.value.columns;
  if (Array.isArray(preferred) && preferred.length > 0) return preferred;
  if (items.value.length > 0) return Object.keys(items.value[0]).slice(0, 8);
  return ['id'];
});

const filteredItems = computed(() => {
  const q = (search.value || '').trim().toLowerCase();
  if (!q) return items.value;
  return items.value.filter((row) => {
    return Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q));
  });
});

function openCreate() {
  editingId.value = null;
  const obj = {};
  for (const f of fields.value) obj[f.key] = '';
  draft.value = obj;
  showModal.value = true;
}

function openEdit(row) {
  editingId.value = row.id;
  const obj = {};
  for (const f of fields.value) obj[f.key] = row[f.key] ?? '';
  draft.value = obj;
  showModal.value = true;
}

function fieldVisible(f) {
  if (editingId.value && f.createOnly) return false;
  if (!editingId.value && f.editOnly) return false;
  return true;
}

function close() {
  showModal.value = false;
}

function castDraft() {
  const out = {};
  for (const f of fields.value) {
    if (!fieldVisible(f)) continue;
    let v = draft.value[f.key];
    if (f.type === 'number') {
      const n = Number(v);
      v = Number.isFinite(n) ? n : null;
    }
    if (v === '') v = null;
    out[f.key] = v;
  }
  return out;
}

const rowActions = computed(() => {
  return (actions.value || []).map((a) => {
    return {
      key: a.key,
      label: (row) => (typeof a.label === 'function' ? a.label(row) : a.label),
      method: a.method,
      path: a.path,
      confirm: a.confirm,
      prompt: a.prompt
    };
  });
});

function buildPath(tpl, row) {
  const value = typeof tpl === 'function' ? tpl(row) : tpl;
  return String(value).replace(':id', row.id);
}

async function runAction(action, row) {
  const confirmText = typeof action.confirm === 'function' ? action.confirm(row) : action.confirm;
  if (confirmText) {
    const ok = confirm(confirmText);
    if (!ok) return;
  }

  let body = null;
  if (action.prompt) {
    const label = typeof action.prompt === 'function' ? action.prompt(row) : action.prompt;
    const value = prompt(label);
    if (value == null) return;
    body = { password: value };
  }

  try {
    error.value = '';
    await apiFetch(buildPath(action.path, row), {
      method: action.method,
      body: body ? JSON.stringify(body) : undefined
    });
    await load();
  } catch (e) {
    error.value = e?.message || 'Action failed';
  }
}

async function save() {
  try {
    error.value = '';
    const body = castDraft();
    if (editingId.value) {
      await apiFetch(`${apiBase.value}/${editingId.value}`, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await apiFetch(apiBase.value, { method: 'POST', body: JSON.stringify(body) });
    }
    close();
    await load();
  } catch (e) {
    error.value = e?.message || 'Save failed';
  }
}

async function remove(row) {
  const ok = confirm(`Delete record #${row.id}?`);
  if (!ok) return;

  try {
    error.value = '';
    await apiFetch(`${apiBase.value}/${row.id}`, { method: 'DELETE' });
    await load();
  } catch (e) {
    error.value = e?.message || 'Delete failed';
  }
}

onMounted(load);
watch(() => apiBase.value, load);
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
  padding: 12px;
  color: var(--text-color);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
}

.btn {
  border: 1px solid var(--orange);
  background: rgba(255, 107, 26, 0.1);
  color: var(--text-color);
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  padding: 10px 12px;
  cursor: pointer;
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

.btn--danger {
  border-color: rgba(255, 80, 80, 0.35);
  background: rgba(255, 80, 80, 0.10);
}

.tableWrap {
  margin-top: 12px;
  overflow: auto;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

.table th,
.table td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--card-border);
  color: var(--text-color);
  font-size: 12px;
}

.table th {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--orange);
  background: var(--panel-bg);
}

.actions {
  display: flex;
  gap: 8px;
}

.empty {
  color: var(--dim-text);
  font-size: 12px;
  padding: 10px 0;
}

.modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.modal__panel {
  position: relative;
  width: min(760px, calc(100% - 24px));
  border: 1px solid var(--orange);
  background: var(--bg-color);
  padding: 32px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal__title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 32px;
  letter-spacing: 2px;
  color: var(--text-color);
  margin-bottom: 24px;
  border-bottom: 1px solid var(--card-border);
  padding-bottom: 12px;
}

.form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form__row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form__label {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--dim-text);
}

.form__input {
  background: var(--input-bg);
  border: 1px solid var(--card-border);
  padding: 12px;
  color: var(--text-color);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.form__input:focus {
  border-color: var(--orange);
  background: var(--panel-bg);
}

.modal__actions {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 900px) {
  .form {
    grid-template-columns: 1fr;
  }
}
</style>
