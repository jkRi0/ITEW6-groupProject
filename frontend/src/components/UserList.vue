<template>
  <div class="user-list">
    <UserCard v-for="u in users" :key="u.id" :user="u" @select="$emit('select', $event)" />
  </div>
</template>

<script setup>
import UserCard from './UserCard.vue';

defineProps({
  users: {
    type: Array,
    required: true
  }
});

defineEmits(['select']);
</script>

<style scoped>
.user-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 14px;
}
</style>
