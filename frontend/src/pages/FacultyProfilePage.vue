<template>
  <div class="page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <main class="page__content">
      <div class="page__kicker">FACULTY</div>
      <h2 class="page__title">My Profile</h2>
      <p class="page__desc">Personal details, contact info, expertise, and educational background.</p>

      <div v-if="error" class="banner banner--error">{{ error }}</div>
      <div v-else-if="loading" class="banner">Loading…</div>
      <div v-else-if="!profile" class="banner">No faculty profile record found.</div>

      <div v-if="profile" class="grid">
        <section class="card">
          <div class="card__title">Personal Details</div>
          <div class="form">
            <div class="row row--3">
              <div>
                <label class="label">First Name</label>
                <input class="input" v-model="draft.first_name" />
              </div>
              <div>
                <label class="label">Middle Name</label>
                <input class="input" v-model="draft.middle_name" />
              </div>
              <div>
                <label class="label">Last Name</label>
                <input class="input" v-model="draft.last_name" />
              </div>
            </div>
            <div class="row">
              <label class="label">Gender</label>
              <input class="input" v-model="draft.gender" placeholder="Male / Female" />
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card__title">Contact Info</div>
          <div class="form">
            <div class="row row--2">
              <div>
                <label class="label">Email</label>
                <input class="input" v-model="draft.email" />
              </div>
              <div>
                <label class="label">Contact Number</label>
                <input class="input" v-model="draft.contact_number" />
              </div>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card__title">Professional Info</div>
          <div class="form">
            <div class="row">
              <label class="label">Expertise</label>
              <input class="input" v-model="draft.expertise" placeholder="e.g. Web Development, AI, Networking" />
            </div>
            <div class="row">
              <label class="label">Educational Background</label>
              <textarea class="input" v-model="draft.educational_background" rows="4"></textarea>
            </div>
          </div>
        </section>

        <section class="actions">
          <button class="btn btn--ghost" type="button" :disabled="saving" @click="resetDraft">Reset</button>
          <button class="btn" type="button" :disabled="saving" @click="save">{{ saving ? 'Saving…' : 'Save Changes' }}</button>
        </section>

        <div v-if="success" class="banner banner--success">Saved.</div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const loading = ref(true);
const saving = ref(false);
const error = ref('');
const success = ref(false);

const profile = ref(null);
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

function normalizeDraft(item) {
  return {
    first_name: item?.first_name ?? '',
    middle_name: item?.middle_name ?? '',
    last_name: item?.last_name ?? '',
    gender: item?.gender ?? '',
    email: item?.email ?? '',
    contact_number: item?.contact_number ?? '',
    expertise: item?.expertise ?? '',
    educational_background: item?.educational_background ?? ''
  };
}

function resetDraft() {
  success.value = false;
  draft.value = normalizeDraft(profile.value);
}

async function load() {
  try {
    loading.value = true;
    error.value = '';
    const data = await apiFetch('/academics/faculty/me');
    profile.value = data.item;
    resetDraft();
  } catch (e) {
    error.value = e?.message || 'Failed to load profile';
    profile.value = null;
  } finally {
    loading.value = false;
  }
}

async function save() {
  try {
    saving.value = true;
    error.value = '';
    success.value = false;

    const payload = { ...draft.value };
    for (const k of Object.keys(payload)) {
      if (payload[k] === '') payload[k] = null;
    }

    const data = await apiFetch('/academics/faculty/me', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    profile.value = data.item;
    resetDraft();
    success.value = true;
    setTimeout(() => {
      success.value = false;
    }, 1200);
  } catch (e) {
    error.value = e?.message || 'Failed to save profile';
  } finally {
    saving.value = false;
  }
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

.banner--success {
  border-color: rgba(60, 200, 120, 0.35);
  background: rgba(60, 200, 120, 0.08);
}

.grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  align-items: start;
}

.card {
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 14px;
  transition: all 0.3s;
}

.card__title {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--orange);
  margin-bottom: 12px;
  opacity: 0.85;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row--2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.row--3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.label {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--dim-text);
  opacity: 0.8;
}

.input {
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

.input:focus {
  border-color: var(--orange);
  background: var(--panel-bg);
}

.actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
  margin-top: 4px;
}

.btn {
  border: 1px solid var(--orange);
  background: rgba(255, 107, 26, 0.1);
  color: var(--text-color);
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  padding: 10px 20px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.2s;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
}

.btn:hover:not(:disabled) {
  background: var(--orange);
  color: #fff;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn--ghost {
  background: transparent;
}

@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .row--2,
  .row--3 {
    grid-template-columns: 1fr;
  }

  .actions {
    justify-content: stretch;
  }

  .actions .btn {
    flex: 1;
  }
}
</style>
