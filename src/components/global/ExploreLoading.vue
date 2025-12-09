<script setup lang="ts">
  defineProps<{
    loading: boolean;
  }>();
</script>

<template>
  <div
    class="d-flex justify-center py-2"
    v-if="loading"
  >
    <v-progress-circular
      :width="3"
      color="red"
      indeterminate
    ></v-progress-circular>
  </div>
</template>
