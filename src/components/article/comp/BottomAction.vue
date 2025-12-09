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

  const emits = defineEmits([
    "click-like",
    "click-star",
    "click-reply",
    "click-share",
    "click-reply-to",
  ]);

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

  const inputValue = ref("");
  const isFocusing = ref(false);
  const inputRef = ref<HTMLInputElement | null>(null);

  const inputFocus = (id: string, to: string | null) => {
    replayTo.value = { id };
    if (to) replayTo.value.name = to;
    inputRef.value?.focus();
  };

  defineExpose({ inputFocus });

  const clickReply = () => {
    if (!inputValue.value) return;

    emits(
      "click-reply-to",
      replayTo.value.id,
      inputValue.value,
      replayTo.value
    );
    inputValue.value = "";
  };

  const cancelInput = () => {
    isFocusing.value = false;
    inputValue.value = "";
    replayTo.value = { id: "" };
  };
</script>

<template>
  <v-card
    elevation="0"
    class="w-100 rounded-br-2xl"
  >
    <v-card-text class="pa-0 mt-1">
      <div class="d-flex justify-end ga-2">
        <v-text-field
          ref="inputRef"
          v-model="inputValue"
          variant="outlined"
          density="compact"
          rounded="pill"
          hide-details
          :placeholder="replayTo.name ? `回复@${replayTo.name}` : '输入评论'"
          @focus="isFocusing = true"
          class="flex-1"
          min-width="80px"
          max-width="300px"
        />

        <v-btn
          v-if="isFocusing"
          color="primary"
          rounded="pill"
          @click="clickReply"
        >
          提交
        </v-btn>
        <v-btn
          v-if="isFocusing"
          rounded="pill"
          variant="tonal"
          @click="cancelInput"
        >
          取消
        </v-btn>
        <div
          v-if="!isFocusing"
          class="d-flex align-center"
        >
          <v-btn
            variant="text"
            size="small"
            @click="$emit('click-like', action)"
            class="px-0 mr-1"
          >
            <v-icon :color="action?.isLike ? 'primary' : ''">
              mdi-thumb-up-outline
            </v-icon>
            <span class="ml-1">{{ action?.like_count }}</span>
          </v-btn>
          <v-btn
            variant="text"
            size="small"
            @click="$emit('click-star', action)"
            class="px-0 mr-1"
          >
            <v-icon :color="action?.isStar ? 'primary' : ''">
              mdi-star-outline
            </v-icon>
            <span class="ml-1">{{ action?.star_count }}</span>
          </v-btn>

          <v-btn
            variant="text"
            size="small mr-1"
            @click="$emit('click-reply')"
            class="px-0"
          >
            <v-icon class="mt-1">mdi-message-outline</v-icon>
            <span class="ml-1">{{ action?.comment_count }}</span>
          </v-btn>

          <v-btn
            variant="text"
            size="small"
            @click="$emit('click-share')"
            class="px-0"
            icon="mdi-share-outline"
          ></v-btn>
        </div>
      </div>
    </v-card-text>
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
