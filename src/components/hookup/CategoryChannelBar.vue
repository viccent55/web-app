<script lang="ts" setup>
  const props = defineProps({
    items: {
      type: Array as PropType<EmptyArrayType>,
      default: () => [],
    },
    activeIndex: {
      type: String,
      default: () => "",
    },
  });
  const { isMobile } = useVariable();
</script>

<template>
  <v-slide-group
    :model-value="activeIndex"
    show-arrows
  >
    <v-slide-group-item
      v-for="category in items"
      :key="category.id"
      :value="category.id"
      v-slot="{ isSelected }"
    >
      <v-chip
        :to="`/novel/${category.id}`"
        :color="isSelected ? 'primary' : undefined"
        class="ma-2 text-surface-variant"
        :density="isMobile ? 'compact' : 'default'"
      >
        {{ category.name }}
      </v-chip>
    </v-slide-group-item>
  </v-slide-group>
</template>
