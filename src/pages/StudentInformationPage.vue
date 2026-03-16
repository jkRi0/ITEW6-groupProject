<template>
  <div class="page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <nav>
      <RouterLink class="nav-logo" to="/">CCS — CPS</RouterLink>
      <div class="nav-badge">Student Information &nbsp;|&nbsp; v1.0</div>
      <div class="nav-ready">SYSTEM READY</div>
    </nav>

    <main class="page__content">
      <div class="page__kicker">01 — PRIMARY</div>
      <h2 class="page__title">Student Information</h2>
      <p class="page__desc">
        Central repository for all student records, profiles, and academic history.
      </p>

      <div class="page__actions">
        <RouterLink class="page__back" to="/">← Back to Home</RouterLink>
      </div>
    </main>

    <div class="status-bar status-bar--static">
      <span><span class="status-dot"></span>SYSTEM ONLINE</span>
      <span>MODULE: STUDENT INFORMATION</span>
      <span>SECURE CONNECTION</span>
      <span class="status-bar__right">CCS — COMPREHENSIVE PROFILING SYSTEM</span>
    </div>
  </div>
</template>
