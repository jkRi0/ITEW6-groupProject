<template>
  <aside class="sidebar">
    <div class="sidebar__section">
      <div class="sidebar__section-title">Navigation</div>
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        class="nav-item"
        active-class="nav-item--active"
        :to="item.to"
      >
        {{ item.label }}
      </RouterLink>
    </div>

    <div class="sidebar__section">
      <div class="sidebar__section-title">Quick</div>
      <RouterLink class="nav-item" active-class="nav-item--active" to="/">Home</RouterLink>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  role: {
    type: String,
    required: true
  }
});

const navItems = computed(() => {
  if (props.role === 'student') {
    return [
      { label: 'Dashboard', to: '/student/dashboard' },
      { label: 'My Profile', to: '/student/profile' },
      { label: 'My Schedule', to: '/student/schedule' },
      { label: 'My Courses', to: '/student/enrollments' },
      { label: 'Academic Records', to: '/student/academic-records' },
      { label: 'Learning Materials', to: '/student/materials' },
      { label: 'Skills Profile', to: '/student/skills' },
      { label: 'Achievements', to: '/student/achievements' },
      { label: 'Leadership & Orgs', to: '/student/leadership' },
      { label: 'Sports & Activities', to: '/student/sports' },
      { label: 'Events / Trainings', to: '/student/events' },
    ];
  }

  if (props.role === 'faculty') {
    return [
      { label: 'Dashboard', to: '/faculty/dashboard' },
      { label: 'My Profile', to: '/faculty/profile' },
      { label: 'My Classes / Sections', to: '/faculty/classes' },
      { label: 'Student Search & Profile', to: '/faculty/student-profile' },
      { label: 'Academic Records', to: '/faculty/academic-records' },
      { label: 'Teaching Materials', to: '/faculty/materials' },
      { label: 'Events Participation', to: '/faculty/events' },
      { label: 'Violations', to: '/faculty/violations' },
      { label: 'Achievements & Leadership', to: '/faculty/affiliations' },
    ];
  }

  if (props.role === 'admin') {
    return [
      { label: 'Dashboard', to: '/admin/dashboard' },
      { label: 'Users', to: '/admin/users' },
      { label: 'User Management (CRUD)', to: '/admin/users/manage' },
      { label: 'Student Management', to: '/admin/students' },
      { label: 'Faculty Management', to: '/admin/faculty' },
      { label: 'Course Management', to: '/admin/courses' },
      { label: 'Section Management', to: '/admin/sections' },
      { label: 'Schedule Management', to: '/admin/schedules' },
      { label: 'Enrollment Management', to: '/admin/enrollments' },
      { label: 'Academic Records', to: '/admin/academic-records' },
      { label: 'Non-Academic', to: '/admin/non-academic' },
      { label: 'Skills Management', to: '/admin/skills' },
      { label: 'Affiliation Management', to: '/admin/affiliations' },
      { label: 'Violations', to: '/admin/violations' },
      { label: 'Medical Records', to: '/admin/medical' },
      { label: 'Audit Logs', to: '/admin/audit-logs' }
    ];
  }

  return [{ label: 'Dashboard', to: '/' }];
});
</script>

<style scoped>
.sidebar {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

[data-theme="light"] .sidebar {
  background: rgba(255, 255, 255, 0.5);
}

.sidebar__section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar__section-title {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--orange);
  opacity: 0.6;
  margin-top: 12px;
  margin-bottom: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--dim-text);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  border-left: 2px solid transparent;
  transition: all 0.2s;
}

.nav-item:hover {
  background: var(--panel-bg);
  color: var(--orange);
}

.nav-item--active {
  color: var(--white);
  background: var(--panel-bg);
  border-left-color: var(--orange);
}
</style>
