<script lang="ts" setup>
  defineProps({
    item: {
      type: Object as PropType<EmptyObjectType>,
      default: () => ({}),
    },
  });
</script>

<template>
  <v-card flat>
    <div class="text-subtitle-2 truncate-1">{{ item.title }}</div>
    <div class="text-grey text-caption"></div>
  </v-card>
</template>
<script setup lang="ts"></script>
