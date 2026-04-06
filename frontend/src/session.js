import { reactive } from 'vue';

const state = reactive({
  isAuthenticated: false,
  token: '',
  user: null,
});

function loadFromStorage() {
  state.isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  state.token = localStorage.getItem('token') || '';

  try {
    const raw = localStorage.getItem('user');
    state.user = raw ? JSON.parse(raw) : null;
  } catch {
    state.user = null;
  }
}

function setSession({ token, user }) {
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('token', token || '');
  localStorage.setItem('user', JSON.stringify(user || null));
  loadFromStorage();
}

function clearSession() {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  loadFromStorage();
}

loadFromStorage();

export const session = {
  state,
  loadFromStorage,
  setSession,
  clearSession,
};
