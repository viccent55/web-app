<script setup lang="ts">
defineProps<{
  items: {
    text: string;
    href?: string;
    disabled?: boolean;
  }[];
}>();
</script>

<template>
  <v-breadcrumbs class="mb-2 text-body-2 px-0">
    <template v-for="(crumb, index) in items" :key="index">
      <v-breadcrumbs-item
        :to="crumb.href"
        :disabled="crumb.disabled"
      >
        <template v-if="!crumb.disabled">
          <span>{{ crumb.text }}</span>
          <v-icon class="mx-1" icon="mdi-chevron-right" />
        </template>
        <template v-if="crumb.disabled">
          {{ crumb.text }}
        </template>
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>