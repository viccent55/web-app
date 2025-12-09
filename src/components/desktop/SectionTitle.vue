<template>
  <div class="d-flex align-center ga-3 mb-3 mt-2">
    <v-divider
      class="border-opacity-100"
      color="blue-darken-2"
      :thickness="5"
      vertical
    ></v-divider>
    <div class="text-h6">{{ title }}</div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{ title: string }>();
</script>
