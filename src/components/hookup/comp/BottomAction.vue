<script setup lang="ts">
  import { ref, watchEffect } from "vue";

  const props = withDefaults(
    defineProps<{
      action: Record<string, any>;
      total?: number;
    }>(),
    {
      total: 0,
    }
  );

  const emits = defineEmits(["click-star", "click-deposit", "live-chat"]);

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
    class="w-100"
  >
    <div class="d-flex align-center ga-2 justify-space-around">
      <v-btn
        variant="text"
        density="comfortable"
        @click="$emit('live-chat')"
        class="px-0"
      >
        <v-icon>mdi-comment-outline</v-icon>
        联系客服
      </v-btn>
      <v-btn
        variant="text"
        density="comfortable"
        @click="$emit('click-star', action)"
        class="px-0"
      >
        <v-icon
          class="mr-1"
          :color="action?.is_star ? 'primary' : ''"
        >
          mdi-heart-outline
        </v-icon>
        收藏
      </v-btn>

      <v-btn
        density="comfortable"
        @click="$emit('click-deposit')"
        color="primary"
        variant="elevated"
        rounded="xl"
        width="100px"
      >
        免定金
      </v-btn>
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
