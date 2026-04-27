<template>
  <div class="page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <main class="page__content">
      <div class="page__kicker">STUDENT</div>
      <h2 class="page__title">Skills Profile</h2>
      <p class="page__desc">Manage your technical and soft skills, proficiency levels, and evidence links.</p>

      <div v-if="error" class="banner banner--error">{{ error }}</div>
      <div v-if="success" class="banner banner--success">{{ success }}</div>

      <div class="toolbar">
        <input class="toolbar__search" placeholder="Search skills..." v-model="search" />
        <button class="btn" @click="openModal()">+ Add New Skill</button>
      </div>

      <div v-if="loading" class="banner">Loading skills...</div>
      <div v-else-if="filteredItems.length === 0" class="empty">No skills found.</div>

      <div v-else class="skills-grid">
        <div v-for="item in filteredItems" :key="item.id" class="skill-card">
          <div class="skill-card__body">
            <h3 class="skill-card__name">{{ item.name }}</h3>
            <div class="skill-card__level">
              <span class="label">Level:</span> {{ item.level || 'Not specified' }}
            </div>
            <div v-if="item.evidence_url" class="skill-card__link">
              <a :href="item.evidence_url" target="_blank" rel="noopener noreferrer">View Evidence ↗</a>
            </div>
            <div class="skill-card__date">Added: {{ formatDate(item.created_at) }}</div>
          </div>
          <div class="skill-card__actions">
            <button class="btn btn--small btn--ghost" @click="openModal(item)">Edit</button>
            <button class="btn btn--small btn--danger" @click="deleteSkill(item.id)">Delete</button>
          </div>
        </div>
      </div>

      <!-- Skill Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal__header">
            <h3 class="modal__title">{{ editingId ? 'Edit Skill' : 'Add New Skill' }}</h3>
            <button class="modal__close" @click="closeModal">&times;</button>
          </div>
          <form @submit.prevent="saveSkill" class="modal__form">
            <div class="form-group">
              <label>Skill Name</label>
              <input v-model="form.name" :disabled="!!editingId" placeholder="e.g. JavaScript, Public Speaking" required />
              <small v-if="editingId">Name cannot be changed. Delete and re-add if needed.</small>
            </div>
            <div class="form-group">
              <label>Proficiency Level</label>
              <select v-model="form.level">
                <option value="">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <div class="form-group">
              <label>Evidence URL (Optional)</label>
              <input v-model="form.evidence_url" type="url" placeholder="https://github.com/yourproject" />
            </div>
            <div class="modal__footer">
              <button type="button" class="btn btn--ghost" @click="closeModal">Cancel</button>
              <button type="submit" class="btn" :disabled="saving">{{ saving ? 'Saving...' : 'Save Skill' }}</button>
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
  name: '',
  level: '',
  evidence_url: ''
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

async function loadSkills() {
  try {
    loading.value = true;
    const data = await apiFetch('/skills/student/list');
    items.value = data.items || [];
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

const filteredItems = computed(() => {
  const q = search.value.toLowerCase();
  return items.value.filter(i => 
    i.name.toLowerCase().includes(q) || 
    (i.level && i.level.toLowerCase().includes(q))
  );
});

function openModal(item = null) {
  if (item) {
    editingId.value = item.id;
    form.value = {
      name: item.name,
      level: item.level || '',
      evidence_url: item.evidence_url || ''
    };
  } else {
    editingId.value = null;
    form.value = { name: '', level: '', evidence_url: '' };
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = null;
  form.value = { name: '', level: '', evidence_url: '' };
}

async function saveSkill() {
  try {
    saving.value = true;
    error.value = '';
    
    if (editingId.value) {
      await apiFetch(`/skills/student/${editingId.value}`, {
        method: 'PUT',
        body: JSON.stringify({
          level: form.value.level,
          evidence_url: form.value.evidence_url
        })
      });
      success.value = 'Skill updated successfully';
    } else {
      await apiFetch('/skills/student', {
        method: 'POST',
        body: JSON.stringify(form.value)
      });
      success.value = 'Skill added successfully';
    }
    
    closeModal();
    loadSkills();
    setTimeout(() => { success.value = ''; }, 3000);
  } catch (err) {
    error.value = err.message;
  } finally {
    saving.value = false;
  }
}

async function deleteSkill(id) {
  if (!confirm('Are you sure you want to delete this skill?')) return;
  try {
    await apiFetch(`/skills/student/${id}`, { method: 'DELETE' });
    success.value = 'Skill deleted';
    loadSkills();
    setTimeout(() => { success.value = ''; }, 3000);
  } catch (err) {
    error.value = err.message;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString();
}

onMounted(loadSkills);
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
  margin-bottom: 24px;
  align-items: stretch;
}

.toolbar__search {
  flex: 1;
  background: var(--input-bg);
  border: 1px solid var(--card-border);
  padding: 12px 16px;
  color: var(--text-color);
  outline: none;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
}

.toolbar__search:focus {
  border-color: var(--orange);
  background: var(--panel-bg);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.skill-card {
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}

.skill-card:hover {
  border-color: var(--orange);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(255, 107, 26, 0.15);
}

.skill-card__body {
  padding: 20px;
  flex: 1;
}

.skill-card__name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 24px;
  letter-spacing: 1px;
  color: var(--text-color);
  margin-bottom: 12px;
  text-transform: uppercase;
}

.skill-card__level {
  font-size: 13px;
  color: var(--dim-text);
  margin-bottom: 8px;
}

.skill-card__link a {
  color: var(--orange);
  text-decoration: none;
  font-size: 12px;
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.skill-card__date {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  color: var(--dim-text);
  opacity: 0.6;
  margin-top: 16px;
}

.skill-card__actions {
  display: flex;
  border-top: 1px solid var(--card-border);
  background: var(--panel-bg);
}

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

.btn--danger {
  color: #ff4444;
}

.btn--danger:hover {
  background: rgba(255, 68, 68, 0.15) !important;
  color: #ff6666;
}

/* Action Buttons */
.btn {
  background: rgba(255, 107, 26, 0.1);
  border: 1px solid var(--orange);
  color: var(--text-color);
  padding: 12px 24px;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  background: var(--orange);
  color: #fff;
  transform: translateY(-1px);
}

.btn--ghost {
  background: transparent;
  border-color: rgba(245, 245, 240, 0.2);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal {
  background: var(--bg-color);
  border: 1px solid var(--orange);
  width: 100%;
  max-width: 450px;
  position: relative;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  transition: background-color 0.3s;
}

.modal::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  width: 20px;
  height: 20px;
  border-top: 2px solid var(--orange);
  border-left: 2px solid var(--orange);
}

.modal__header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--card-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--panel-bg);
}

.modal__title {
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  text-transform: uppercase;
  color: var(--orange);
  letter-spacing: 2px;
}

.modal__close {
  background: none;
  border: none;
  color: rgba(245, 245, 240, 0.5);
  font-size: 24px;
  cursor: pointer;
  transition: color 0.2s;
}

.modal__close:hover {
  color: var(--white);
}

.modal__form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  color: var(--dim-text);
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.form-group input, 
.form-group select {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--card-border);
  padding: 12px;
  color: var(--text-color);
  outline: none;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--orange);
  background: var(--panel-bg);
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.form-group small {
  display: block;
  margin-top: 6px;
  font-size: 10px;
  color: rgba(245, 245, 240, 0.3);
  font-family: 'Space Mono', monospace;
}

.banner {
  margin-top: 14px;
  padding: 12px 16px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  color: var(--text-color);
  margin-bottom: 16px;
  font-size: 13px;
  font-family: 'Space Mono', monospace;
  transition: all 0.3s;
}

.banner--success {
  border-color: rgba(68, 255, 68, 0.2);
  background: rgba(68, 255, 68, 0.05);
  color: #22c55e;
}

.banner--error {
  border-color: rgba(255, 68, 68, 0.2);
  background: rgba(255, 68, 68, 0.05);
  color: #ef4444;
}

.label {
  font-weight: bold;
  color: var(--orange);
}
</style>
