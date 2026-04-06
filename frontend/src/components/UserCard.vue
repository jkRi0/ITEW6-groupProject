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
  border: 1px solid rgba(255, 107, 26, 0.12);
  background: rgba(26, 26, 26, 0.55);
  padding: 14px;
  cursor: pointer;
}

.user-card:hover {
  border-color: rgba(255, 107, 26, 0.35);
  background: rgba(255, 107, 26, 0.06);
}

.user-card__title {
  color: var(--white);
  font-family: 'Space Mono', monospace;
  font-size: 13px;
}

.user-card__meta {
  margin-top: 6px;
  color: rgba(245, 245, 240, 0.55);
  font-size: 12px;
}
</style>
