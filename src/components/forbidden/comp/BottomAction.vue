<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      action: Record<string, any>;
      total?: number;
    }>(),
    {
      total: 0,
    }
  );

  const emits = defineEmits(["click-like", "click-star", "click-share"]);

  const replayTo = ref<{ id: string; name?: string }>({
    id: "",
    name: "",
  });

  watchEffect(() => {
    const item = props.action;
    if (item) {
      replayTo.value.id = item.id;
      replayTo.value.name = item.author?.name || "";
    }
  });
  const inputRef = ref<HTMLInputElement | null>(null);
  const inputFocus = (id: string, to: string | null) => {
    replayTo.value = { id };
    if (to) replayTo.value.name = to;
    inputRef.value?.focus();
  };

  defineExpose({ inputFocus });
</script>

<template>
  <v-card
    elevation="0"
    class="bottom-action pa-0"
  >
    <div class="d-flex align-center">
      <v-btn
        variant="text"
        density="comfortable"
        class="px-0"
      >
        <v-icon>mdi-eye-outline</v-icon>
        <span class="ml-1">{{ action?.view_count }}</span>
      </v-btn>
      <v-btn
        variant="text"
        density="comfortable"
        @click="$emit('click-like', action)"
        class="px-0"
      >
        <v-icon :color="action?.liked ? 'primary' : ''">
          mdi-thumb-up-outline
        </v-icon>
        <span class="ml-1">{{ action?.like_count }}</span>
      </v-btn>
      <v-btn
        variant="text"
        density="comfortable"
        @click="$emit('click-star', action)"
        class="px-0"
      >
        <v-icon :color="action?.stared ? 'primary' : ''">
          mdi-star-outline
        </v-icon>
        <span class="ml-1">{{ action?.star_count }}</span>
      </v-btn>

      <v-btn
        variant="text"
        density="comfortable"
        @click="$emit('click-share')"
        class="px-0"
        icon="mdi-share-outline"
      ></v-btn>
    </div>
  </v-card>
</template>

<style scoped lang="scss">
  .actions-container .v-btn {
    display: flex;
    align-items: center;
    font-size: 14px;
  }

  .v-btn span {
    font-size: 14px;
  }
</style>
