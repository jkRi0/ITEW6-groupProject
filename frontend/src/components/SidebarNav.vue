<template>
  <aside class="sidebar">
    <div class="sidebar__section">
      <div class="sidebar__title">Navigation</div>
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        class="sidebar__link"
        :to="item.to"
      >
        {{ item.label }}
      </RouterLink>
    </div>

    <div class="sidebar__section">
      <div class="sidebar__title">Quick</div>
      <RouterLink class="sidebar__link" to="/">Home</RouterLink>
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
      { label: 'Advising Notes', to: '/student/advising-notes' },
      
    ];
  }

  if (props.role === 'faculty') {
    return [
      { label: 'Dashboard', to: '/faculty/dashboard' },
      { label: 'My Profile', to: '/faculty/profile' },
      { label: 'My Classes / Sections', to: '/faculty/classes' },
      { label: 'Class Roster', to: '/faculty/roster' },
      { label: 'Student Profile', to: '/faculty/student-profile' },
      { label: 'Academic Records', to: '/faculty/academic-records' },
      { label: 'Teaching Materials', to: '/faculty/materials' },
      { label: 'Advising Notes', to: '/faculty/advising-notes' },
      { label: 'Events Participation', to: '/faculty/events' },
      { label: 'Violations', to: '/faculty/violations' },
      { label: 'Achievements & Leadership', to: '/faculty/affiliations' },
      
    ];
  }

  if (props.role === 'admin') {
    return [
      { label: 'Dashboard', to: '/admin/dashboard' },
      { label: 'User Management', to: '/admin/users' },
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
      { label: 'Documents', to: '/admin/documents' },
      
      { label: 'Audit Logs', to: '/admin/audit-logs' }
    ];
  }

  return [{ label: 'Dashboard', to: '/' }];
});
</script>

<style scoped>
.sidebar {
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.sidebar__section {
  border: 1px solid rgba(255, 107, 26, 0.12);
  background: rgba(26, 26, 26, 0.55);
  padding: 14px;
}

.sidebar__title {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 107, 26, 0.85);
  margin-bottom: 10px;
}

.sidebar__link {
  display: block;
  text-decoration: none;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.8px;
  color: rgba(245, 245, 240, 0.6);
  padding: 10px 10px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.sidebar__link:hover {
  color: var(--white);
  border-color: rgba(255, 107, 26, 0.25);
  background: rgba(255, 107, 26, 0.06);
}

.router-link-active {
  color: var(--white);
  border-color: rgba(255, 107, 26, 0.4);
  background: rgba(255, 107, 26, 0.1);
}
</style>
