<template>
  <div class="page">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>

    <main class="page__content">
      <div class="page__kicker">STUDENT</div>
      <h2 class="page__title">Learning Materials</h2>
      <p class="page__desc">Access syllabi, curriculum guides, and lesson modules for your courses.</p>

      <div v-if="error" class="banner banner--error">{{ error }}</div>
      <div v-else-if="loading" class="banner">Loading materials…</div>

      <div v-if="!loading && courses.length === 0" class="empty">You are not currently enrolled in any courses with materials.</div>

      <div v-if="courses.length > 0" class="materials">
        <aside class="materials__sidebar">
          <div class="sidebar__title">Your Courses</div>
          <div 
            v-for="c in courses" 
            :key="c.course_id" 
            class="course-tab" 
            :class="{ 'course-tab--active': selectedCourse?.course_id === c.course_id }"
            @click="selectCourse(c)"
          >
            <div class="course-tab__code">{{ c.course_code }}</div>
            <div class="course-tab__title">{{ c.course_title }}</div>
          </div>
        </aside>

        <section class="materials__main" v-if="selectedCourse">
          <div class="main__header">
            <h3 class="main__title">{{ selectedCourse.course_code }} — {{ selectedCourse.course_title }}</h3>
            <div class="main__meta">{{ selectedCourse.academic_year }} · {{ selectedCourse.term }}</div>
          </div>

          <div class="tabs">
            <button 
              class="tab-btn" 
              :class="{ 'tab-btn--active': activeTab === 'syllabus' }" 
              @click="activeTab = 'syllabus'"
            >
              Syllabus & Curriculum
            </button>
            <button 
              class="tab-btn" 
              :class="{ 'tab-btn--active': activeTab === 'lessons' }" 
              @click="activeTab = 'lessons'"
            >
              Lessons & Modules
            </button>
          </div>

          <div class="tab-content">
            <div v-if="activeTab === 'syllabus'" class="tab-pane syllabus-pane">
              <div class="pane-section">
                <div class="pane-section__label">Course Syllabus</div>
                <div v-if="selectedCourse.syllabus" class="pane-section__content content-box" v-html="formatContent(selectedCourse.syllabus)"></div>
                <div v-else class="pane-section__empty">No syllabus available yet.</div>
              </div>

              <div class="pane-section">
                <div class="pane-section__label">Curriculum Guide</div>
                <div v-if="selectedCourse.curriculum" class="pane-section__content content-box" v-html="formatContent(selectedCourse.curriculum)"></div>
                <div v-else class="pane-section__empty">No curriculum guide available yet.</div>
              </div>
            </div>

            <div v-if="activeTab === 'lessons'" class="tab-pane lessons-pane">
              <div v-if="lessonsLoading" class="banner">Loading lessons…</div>
              <div v-else-if="lessons.length === 0" class="pane-section__empty">No lessons uploaded for this course.</div>
              <div v-else class="lessons-list">
                <div v-for="l in lessons" :key="l.id" class="lesson-card">
                  <div class="lesson-card__header" @click="toggleLesson(l.id)">
                    <div class="lesson-card__title">
                      <span class="lesson-card__index">#{{ l.order_index || 0 }}</span>
                      {{ l.title }}
                    </div>
                    <div class="lesson-card__chevron" :class="{ 'lesson-card__chevron--open': expandedLessons.includes(l.id) }">
                      ▼
                    </div>
                  </div>
                  <div v-if="expandedLessons.includes(l.id)" class="lesson-card__content content-box" v-html="formatContent(l.content)"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section v-else class="materials__main materials__main--empty">
          <div class="empty-state">
            <div class="empty-state__icon">📚</div>
            <p>Select a course from the sidebar to view its learning materials.</p>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

const loading = ref(true);
const error = ref('');
const courses = ref([]);
const selectedCourse = ref(null);
const activeTab = ref('syllabus');

const lessons = ref([]);
const lessonsLoading = ref(false);
const expandedLessons = ref([]);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token') || '';
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
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

async function load() {
  try {
    loading.value = true;
    error.value = '';
    const data = await apiGet('/academics/student/materials');
    courses.value = data.items || [];
    if (courses.value.length > 0) {
      selectedCourse.value = courses.value[0];
    }
  } catch (e) {
    error.value = e?.message || 'Failed to load materials';
    courses.value = [];
  } finally {
    loading.value = false;
  }
}

async function fetchLessons(courseId) {
  try {
    lessonsLoading.value = true;
    const data = await apiGet(`/academics/courses/${courseId}/lessons`);
    lessons.value = data.items || [];
    expandedLessons.value = [];
    if (lessons.value.length > 0) {
      expandedLessons.value.push(lessons.value[0].id);
    }
  } catch (e) {
    console.error('Failed to load lessons', e);
    lessons.value = [];
  } finally {
    lessonsLoading.value = false;
  }
}

function selectCourse(c) {
  selectedCourse.value = c;
}

function toggleLesson(id) {
  const idx = expandedLessons.value.indexOf(id);
  if (idx > -1) {
    expandedLessons.value.splice(idx, 1);
  } else {
    expandedLessons.value.push(id);
  }
}

function formatContent(text) {
  if (!text) return '';
  return text.replace(/\n/g, '<br>');
}

watch(selectedCourse, (newVal) => {
  if (newVal) {
    fetchLessons(newVal.course_id);
  }
});

onMounted(load);
</script>

<style scoped>
.materials {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  margin-top: 24px;
  min-height: 600px;
}

.materials__sidebar {
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s;
}

.sidebar__title {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--orange);
  opacity: 0.85;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--card-border);
}

.course-tab {
  padding: 14px;
  border: 1px solid var(--card-border);
  background: var(--panel-bg);
  cursor: pointer;
  transition: all 0.2s;
}

.course-tab:hover {
  background: rgba(255, 107, 26, 0.05);
  border-color: var(--orange);
}

.course-tab--active {
  background: rgba(255, 107, 26, 0.1);
  border-color: var(--orange);
}

.course-tab__code {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  color: var(--orange);
  margin-bottom: 4px;
}

.course-tab__title {
  font-size: 13px;
  color: var(--text-color);
  line-height: 1.4;
  opacity: 0.85;
}

.materials__main {
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}

.materials__main--empty {
  justify-content: center;
  align-items: center;
  color: rgba(245, 245, 240, 0.45);
}

.empty-state {
  text-align: center;
}

.empty-state__icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.main__header {
  margin-bottom: 24px;
}

.main__title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 28px;
  letter-spacing: 1px;
  color: var(--text-color);
  margin-bottom: 4px;
}

.main__meta {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  color: var(--dim-text);
}

.tabs {
  display: flex;
  gap: 2px;
  background: var(--panel-bg);
  padding: 2px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  padding: 12px;
  color: var(--dim-text);
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-color);
}

.tab-btn--active {
  background: rgba(255, 107, 26, 0.15);
  color: var(--orange);
}

.pane-section {
  margin-bottom: 32px;
}

.pane-section__label {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 107, 26, 0.85);
  margin-bottom: 12px;
}

.content-box {
  background: var(--panel-bg);
  border: 1px solid var(--card-border);
  padding: 16px;
  line-height: 1.6;
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.85;
}

.pane-section__empty {
  color: var(--dim-text);
  font-style: italic;
  font-size: 13px;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lesson-card {
  border: 1px solid var(--card-border);
  background: var(--panel-bg);
}

.lesson-card__header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
}

.lesson-card__header:hover {
  background: rgba(255, 107, 26, 0.05);
}

.lesson-card__title {
  font-size: 14px;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 12px;
}

.lesson-card__index {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  color: var(--orange);
  opacity: 0.8;
}

.lesson-card__chevron {
  font-size: 10px;
  color: rgba(255, 107, 26, 0.45);
  transition: transform 0.3s;
}

.lesson-card__chevron--open {
  transform: rotate(180deg);
}

.lesson-card__content {
  border-top: 1px solid var(--card-border);
  background: rgba(0, 0, 0, 0.05);
}

@media (max-width: 900px) {
  .materials {
    grid-template-columns: 1fr;
  }
}

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

.empty {
  margin-top: 16px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 12px 14px;
  color: var(--dim-text);
  font-size: 13px;
  transition: all 0.3s;
}
</style>
