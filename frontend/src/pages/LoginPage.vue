<template>
  <div class="auth-page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>
    
    <nav>
      <RouterLink to="/" class="nav-logo">CCS — CPS</RouterLink>
      <div class="nav-badge">Secure Authentication &nbsp;|&nbsp; v1.0</div>
      <RouterLink to="/" class="nav-ready">BACK TO HOME</RouterLink>
    </nav>

    <div class="auth-card-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <h2>LOGIN</h2>
          <p>Enter your credentials to access the system</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="name@example.com" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              placeholder="••••••••" 
              required
            />
          </div>

          <button type="submit" class="btn-primary auth-btn">Login to Account</button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <RouterLink to="/register">Register here</RouterLink></p>
        </div>
      </div>
    </div>

    <div class="status-bar status-bar--static">
      <span><span class="status-dot"></span>SECURE LOGIN</span>
      <span class="status-bar__right">CCS — COMPREHENSIVE PROFILING SYSTEM</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.user.role === 'student') {
        router.push('/student/dashboard');
      } else if (data.user.role === 'faculty') {
        router.push('/faculty/dashboard');
      } else if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student-information');
      }
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Server error. Is the backend running?');
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  position: relative;
}

.auth-card-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 140px 20px 110px;
  position: relative;
  z-index: 2;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--gray);
  border: 1px solid rgba(255, 107, 26, 0.15);
  padding: 48px 40px;
  position: relative;
  clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%);
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--orange);
}

.auth-header {
  margin-bottom: 32px;
  text-align: left;
}

.auth-header h2 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 32px;
  letter-spacing: 3px;
  margin-bottom: 8px;
  color: var(--white);
}

.auth-header p {
  color: rgba(245, 245, 240, 0.4);
  font-size: 13px;
  font-family: 'Space Mono', monospace;
  letter-spacing: 0.5px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--orange);
  opacity: 0.8;
}

.form-group input {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 107, 26, 0.1);
  padding: 14px;
  color: var(--white);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.form-group input:focus {
  border-color: var(--orange);
  background: rgba(255, 107, 26, 0.05);
}

.auth-btn {
  margin-top: 12px;
  width: 100%;
  justify-content: center;
}

.auth-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 12px;
  color: rgba(245, 245, 240, 0.4);
  font-family: 'Space Mono', monospace;
}

.auth-footer a {
  color: var(--orange);
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 107, 26, 0.2);
  transition: all 0.2s;
}

.auth-footer a:hover {
  border-bottom-color: var(--orange);
  color: var(--white);
}

.nav-logo {
  text-decoration: none;
}
</style>
