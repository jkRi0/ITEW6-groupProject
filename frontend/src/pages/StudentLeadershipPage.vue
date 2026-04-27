<template>
  <div class="page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <main class="page__content">
      <div class="page__kicker">STUDENT</div>
      <h2 class="page__title">Leadership & Organizations</h2>
      <p class="page__desc">Manage your organizational affiliations and leadership positions.</p>

      <div v-if="error" class="banner banner--error">{{ error }}</div>
      <div v-if="success" class="banner banner--success">{{ success }}</div>

      <div class="toolbar">
        <input class="toolbar__search" placeholder="Search organization or position..." v-model="search" />
        <button class="btn" @click="openModal()">+ Add Leadership Record</button>
      </div>

      <div v-if="loading" class="banner">Loading records...</div>
      <div v-else-if="filteredItems.length === 0" class="empty">No leadership records found.</div>

      <div v-else class="leadership-grid">
        <div v-for="item in filteredItems" :key="item.id" class="lead-card">
          <div class="lead-card__body">
            <div class="lead-card__status" :class="item.status?.toLowerCase()">{{ item.status || 'Active' }}</div>
            <h3 class="lead-card__org">{{ item.organization_name }}</h3>
            <div class="lead-card__pos">{{ item.position }}</div>
            <div class="lead-card__term">
              <span class="label">Term:</span> {{ item.term_start }} — {{ item.term_end || 'Present' }}
            </div>
            <div v-if="item.description" class="lead-card__desc">{{ item.description }}</div>
          </div>
          <div class="lead-card__actions">
            <button class="btn btn--small btn--ghost" @click="openModal(item)">Edit</button>
            <button class="btn btn--small btn--danger" @click="deleteRecord(item.id)">Delete</button>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal__header">
            <h3 class="modal__title">{{ editingId ? 'Edit Record' : 'Add Leadership Record' }}</h3>
            <button class="modal__close" @click="closeModal">&times;</button>
          </div>
          <form @submit.prevent="saveRecord" class="modal__form">
            <div class="form-group">
              <label>Organization Name</label>
              <input v-model="form.organization_name" placeholder="e.g. Student Council, CS Society" required />
            </div>
            <div class="form-group">
              <label>Position</label>
              <input v-model="form.position" placeholder="e.g. President, Member" required />
            </div>
            <div class="row row--2">
              <div class="form-group">
                <label>Term Start</label>
                <input v-model="form.term_start" placeholder="e.g. 2023" required />
              </div>
              <div class="form-group">
                <label>Term End</label>
                <input v-model="form.term_end" placeholder="e.g. 2024 or Present" />
              </div>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select v-model="form.status">
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div class="form-group">
              <label>Brief Description (Optional)</label>
              <textarea v-model="form.description" rows="3" placeholder="Key responsibilities or achievements..."></textarea>
            </div>
            <div class="modal__footer">
              <button type="button" class="btn btn--ghost" @click="closeModal">Cancel</button>
              <button type="submit" class="btn" :disabled="saving">{{ saving ? 'Saving...' : 'Save Record' }}</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const items = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
const search = ref('');

const showModal = ref(false);
const saving = ref(false);
const editingId = ref(null);
const form = ref({
  organization_name: '',
  position: '',
  term_start: '',
  term_end: '',
  status: 'Active',
  description: ''
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token') || '';
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function loadRecords() {
  try {
    loading.value = true;
    // Assuming backend endpoint exists or will be added
    const data = await apiFetch('/student/affiliations');
    items.value = data.items || [];
  } catch (err) {
    error.value = 'Failed to load leadership records.';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

const filteredItems = computed(() => {
  const q = search.value.toLowerCase();
  return items.value.filter(i => 
    i.organization_name.toLowerCase().includes(q) || 
    i.position.toLowerCase().includes(q)
  );
});

function openModal(item = null) {
  if (item) {
    editingId.value = item.id;
    form.value = { ...item };
  } else {
    editingId.value = null;
    form.value = { organization_name: '', position: '', term_start: '', term_end: '', status: 'Active', description: '' };
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = null;
}

async function saveRecord() {
  try {
    saving.value = true;
    error.value = '';
    
    if (editingId.value) {
      await apiFetch(`/student/affiliations/${editingId.value}`, {
        method: 'PUT',
        body: JSON.stringify(form.value)
      });
      success.value = 'Record updated successfully';
    } else {
      await apiFetch('/student/affiliations', {
        method: 'POST',
        body: JSON.stringify(form.value)
      });
      success.value = 'Record added successfully';
    }
    
    closeModal();
    loadRecords();
    setTimeout(() => { success.value = ''; }, 3000);
  } catch (err) {
    error.value = err.message;
  } finally {
    saving.value = false;
  }
}

async function deleteRecord(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  try {
    await apiFetch(`/student/affiliations/${id}`, { method: 'DELETE' });
    success.value = 'Record deleted';
    loadRecords();
    setTimeout(() => { success.value = ''; }, 3000);
  } catch (err) {
    error.value = err.message;
  }
}

onMounted(loadRecords);
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
  margin-bottom: 24px;
}

.toolbar__search {
  flex: 1;
  background: var(--input-bg);
  border: 1px solid var(--card-border);
  padding: 12px 16px;
  color: var(--text-color);
  outline: none;
  font-family: 'DM Sans', sans-serif;
}

.leadership-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.lead-card {
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}

.lead-card:hover {
  border-color: var(--orange);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(255, 107, 26, 0.15);
}

.lead-card__body {
  padding: 24px;
  flex: 1;
}

.lead-card__status {
  display: inline-block;
  font-family: 'Space Mono', monospace;
  font-size: 9px;
  text-transform: uppercase;
  padding: 2px 8px;
  border: 1px solid var(--orange);
  color: var(--orange);
  margin-bottom: 12px;
}

.lead-card__status.completed {
  border-color: var(--dim-text);
  color: var(--dim-text);
}

.lead-card__org {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 26px;
  letter-spacing: 1px;
  color: var(--text-color);
  margin-bottom: 4px;
  text-transform: uppercase;
}

.lead-card__pos {
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  color: var(--orange);
  margin-bottom: 16px;
}

.lead-card__term {
  font-size: 12px;
  color: var(--dim-text);
  margin-bottom: 12px;
}

.lead-card__desc {
  font-size: 13px;
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.5;
  border-top: 1px solid var(--card-border);
  padding-top: 12px;
  margin-top: 12px;
}

.lead-card__actions {
  display: flex;
  border-top: 1px solid var(--card-border);
  background: var(--panel-bg);
}

.row--2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group textarea {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--card-border);
  padding: 12px;
  color: var(--text-color);
  outline: none;
  font-family: 'DM Sans', sans-serif;
  resize: vertical;
}

.form-group textarea:focus {
  border-color: var(--orange);
}

/* Reusing your global button/modal styles */
.btn--small {
  flex: 1;
  padding: 12px;
  font-size: 10px;
  border: none;
  background: transparent;
  color: var(--dim-text);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-family: 'Space Mono', monospace;
  cursor: pointer;
  transition: all 0.2s;
}

.btn--small:first-child {
  border-right: 1px solid var(--card-border);
}

.btn--small:hover {
  background: rgba(255, 107, 26, 0.08);
  color: var(--text-color);
}

.btn--danger { color: #ff4444; }
.btn--danger:hover { background: rgba(255, 68, 68, 0.1) !important; }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}

.modal {
  background: var(--bg-color);
  border: 1px solid var(--orange);
  width: 100%; max-width: 500px;
  position: relative;
  transition: background-color 0.3s;
}

.modal__header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--card-border);
  display: flex; justify-content: space-between; align-items: center;
  background: var(--panel-bg);
}

.modal__title {
  font-family: 'Space Mono', monospace;
  font-size: 14px; text-transform: uppercase;
  color: var(--orange); letter-spacing: 2px;
}

.modal__close {
  background: none; border: none; color: var(--dim-text);
  font-size: 24px; cursor: pointer;
}

.modal__form { padding: 20px; }

.form-group { margin-bottom: 16px; }
.form-group label {
  display: block; font-family: 'Space Mono', monospace;
  font-size: 10px; text-transform: uppercase;
  color: var(--dim-text); margin-bottom: 6px;
}

.form-group input, .form-group select {
  width: 100%; background: var(--input-bg);
  border: 1px solid var(--card-border);
  padding: 10px; color: var(--text-color);
  outline: none;
}

.modal__footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; }

.banner {
  margin-top: 14px; padding: 12px 16px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  color: var(--text-color);
  margin-bottom: 16px;
  font-size: 13px; font-family: 'Space Mono', monospace;
}
</style>
