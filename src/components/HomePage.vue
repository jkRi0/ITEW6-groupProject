<template>
  <div>
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <nav>
      <div class="nav-logo">CCS — CPS</div>
      <div class="nav-badge">Comprehensive Profiling System &nbsp;|&nbsp; v1.0</div>
      <div class="nav-ready">SYSTEM READY</div>
    </nav>

    <div class="hero">
      <div class="divider-line"></div>
      <div class="hero-number">CCS</div>

      <div class="hero-left">
        <div class="eyebrow">College of Computer Studies</div>
        <h1>COMPRE<span>HENSIVE</span></h1>
        <div class="sub-title">Profiling System</div>
        <p class="hero-desc">
          A unified platform managing student information, faculty records, instruction, scheduling, events, and
          intelligent search — all in one integrated ecosystem.
        </p>
        <div class="cta-group">
          <RouterLink class="btn-primary" to="/student-information">Access System</RouterLink>
          <a class="btn-secondary" href="#modules">View Modules</a>
        </div>
      </div>

      <div class="hero-right" id="modules">
        <div class="modules-grid">
          <RouterLink class="module-card featured" to="/student-information">
            <div class="module-icon">01 — PRIMARY</div>
            <div class="module-name">Student Information</div>
            <div class="module-sub">Central repository for all student records, profiles, and academic history</div>
          </RouterLink>

          <RouterLink class="module-card" to="/faculty">
            <div class="module-icon">02</div>
            <div class="module-name">Faculty</div>
            <div class="module-sub">Faculty profiles & information management</div>
          </RouterLink>

          <RouterLink class="module-card" to="/instruction">
            <div class="module-icon">03</div>
            <div class="module-name">Instruction</div>
            <div class="module-sub">Syllabus · Lessons · Curriculum</div>
          </RouterLink>

          <RouterLink class="module-card" to="/scheduling">
            <div class="module-icon">04</div>
            <div class="module-name">Scheduling</div>
            <div class="module-sub">Courses · Sections · Rooms · Labs</div>
          </RouterLink>

          <RouterLink class="module-card" to="/events">
            <div class="module-icon">05</div>
            <div class="module-name">Events</div>
            <div class="module-sub">Curricular & Extra-Curricular</div>
          </RouterLink>

          <RouterLink class="module-card module-card-advanced" to="/search-filter">
            <div class="module-icon">06 — ADVANCED</div>
            <div class="module-name">Comprehensive Search / Filter</div>
            <div class="module-sub">Intelligent cross-module search and advanced filtering engine</div>
          </RouterLink>
        </div>
      </div>

      <div class="corner-tag">© CCS · 2025 · All Rights Reserved</div>
    </div>

    <div class="status-bar">
      <span><span class="status-dot"></span>SYSTEM ONLINE</span>
      <span>MODULES: 6 ACTIVE</span>
      <span>SECURE CONNECTION</span>
      <span class="status-bar__right">CCS — COMPREHENSIVE PROFILING SYSTEM</span>
    </div>
  </div>
</template>
