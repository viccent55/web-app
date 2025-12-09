<script setup lang="ts">
  const props = defineProps({
    modelValue: Boolean,
    tags: {
      type: Array as PropType<EmptyArrayType>,
      default: () => [],
    },
  });

  const emit = defineEmits(["update:modelValue", "select"]);
  const model = computed({
    get: () => props.modelValue,
    set: (v) => emit("update:modelValue", v),
  });

  const state = reactive({
    search: "",
    selectedTag: null,
  });

  const filteredTags = computed(() => {
    if (!state.search) return props.tags;
    const q = state.search.toLowerCase();
    return props.tags.filter((item: EmptyObjectType) =>
      item.name.toLowerCase().includes(q)
    );
  });
  const confirm = () => {
    emit("select", state.selectedTag);
    model.value = false;
  };
</script>

<template>
  <v-dialog
    v-model="model"
    location="top"
    transition="slide-y-transition"
    max-width="500px"
  >
    <v-card class="pa-3">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex ga-2 align-center">
          <v-icon size="25">mdi-filter</v-icon>
          <span class="text-h6">更多筛选</span>
        </div>
        <div class="d-flex ga-3 align-center">
          <v-btn
            density="comfortable"
            @click="
              () => {
                state.search = '';
                state.selectedTag = null;
                confirm();
              }
            "
            color="warning"
            variant="tonal"
            rounded="xl"
            flat
          >
            重置
            <v-icon>mdi-restore</v-icon>
          </v-btn>
          <v-btn
            icon
            color="primary"
            variant="text"
            size="small"
            @click="model = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Search -->
      <v-text-field
        v-model="state.search"
        density="compact"
        color="primary"
        placeholder="请输入省份/城市查询"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        rounded="xl"
        class="mb-3"
        hide-details
      />

      <!-- Hot Cities -->
      <p class="text-subtitle-2 mb-2">标签选择</p>
      <div class="d-flex flex-wrap ga-4 mb-3">
        <v-chip
          v-for="(tag, index) in filteredTags"
          :key="index"
          rounded="lg"
          :color="state.selectedTag === tag.id ? 'primary' : ''"
          @click="state.selectedTag = tag.id"
        >
          {{ tag?.name }}
        </v-chip>
      </div>

      <v-btn
        class="mt-4 rounded-pill"
        color="primary"
        block
        size="large"
        @click="confirm"
      >
        确定
      </v-btn>
    </v-card>
  </v-dialog>
</template>
