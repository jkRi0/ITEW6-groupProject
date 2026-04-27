<template>
  <button class="user-card" type="button" @click="$emit('select', user)">
    <div class="user-card__title">{{ user.full_name }}</div>
    <div class="user-card__meta">{{ user.email }}</div>
    <div class="user-card__meta">Role: {{ user.role }}</div>
  </button>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    required: true
  }
});

defineEmits(['select']);
</script>

<style scoped>
.user-card {
  width: 100%;
  text-align: left;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  padding: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.user-card:hover {
  border-color: var(--orange);
  background: var(--panel-bg);
}

.user-card__title {
  color: var(--text-color);
  font-family: 'Space Mono', monospace;
  font-size: 13px;
}

.user-card__meta {
  margin-top: 6px;
  color: var(--dim-text);
  font-size: 12px;
}
</style>
