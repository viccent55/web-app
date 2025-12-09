<script lang="ts" setup>
import useVariable from '@/composables/useVariable';
import { screenMode } from '@/hooks/useScreenMode';
import router from '@/router';

const props = withDefaults(
  defineProps<{
    page: number;
    total: number;
    limit: number;
    justify?: "start" | "center" | "end";
    basePath?: string;
  }>(),
  {
    justify: "center",
    basePath: "",
  }
);
const { route } = useVariable();
const emit = defineEmits(["page-change"]);

const maxPage = computed(() =>
  Math.max(1, Math.ceil(props.total / props.limit))
);
const inputPage = ref(Number(route.params.page) || 1);

const clampPage = (page: number) =>
  Math.min(Math.max(1, page), maxPage.value);

const getPageUrl = (p: number) => props.basePath + p;

const goToPage = () => {
  const newPage = clampPage(inputPage.value);
  router.push(getPageUrl(newPage))
};

const visiblePages = computed(() => {
  const total = maxPage.value;
  const current = props.page;
  const range = screenMode.value === "phone" ? 3 : 8;
  const half = Math.floor(range / 2);

  let start = Math.max(1, current - half);
  let end = Math.min(total, start + range - 1);
  if (end - start < range - 1) start = Math.max(1, end - range + 1);

  const pages: (number | string)[] = [];
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("…");
  }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total) {
    if (end < total - 1) pages.push("…");
    pages.push(total);
  }
  return pages;
});
watchEffect(() => {
  if (route.params.id) {
    emit("page-change");
  }
});
</script>

<template>
  <v-row dense v-if="total > 0">
    <v-col :class="`d-flex align-center justify-${justify} flex-wrap`">
      <div v-if="screenMode !== 'phone'" class="text-subtitle-2 text-grey me-3">
        共 {{ total }} 条
      </div>

      <nav class="d-flex flex-wrap ma-1" aria-label="Pagination Navigation">
        <!-- Prev -->
        <a :href="getPageUrl(page - 1)" :class="['page-btn', { disabled: page <= 1 }]" aria-label="Previous page">
          <v-icon>mdi-chevron-left</v-icon>
        </a>

        <!-- Pages -->
        <template v-for="p in visiblePages" :key="p">
          <a v-if="p !== '…'" :href="getPageUrl(Number(p))" class="page-btn"
            :class="{ active: p == (route.params.page || 1) }"
            :aria-current="p == route.params.page ? 'page' : undefined">
            {{ p }}
          </a>
          <span v-else class="ellipsis">
            …
          </span>
        </template>

        <!-- Next -->
        <a :href="getPageUrl(page + 1)" :class="['page-btn', { disabled: page >= maxPage }]" aria-label="Next page">
          <v-icon>mdi-chevron-right</v-icon>
        </a>
      </nav>

      <!-- Jump input -->
      <template v-if="screenMode !== 'phone'">
        <v-text-field v-model.number="inputPage" type="number" label="到第" density="compact" class="mx-4 input-paginate"
          hide-details variant="outlined" min="1" max-width="80px" :max="maxPage" @keyup.enter="goToPage"
          @blur="goToPage" />
        <v-btn @click="goToPage" color="primary" variant="outlined" density="comfortable">
          确认
        </v-btn>
      </template>
    </v-col>
  </v-row>
</template>

<style scoped lang="scss">
.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  margin: 2px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid var(--v-theme-grey-lighten-2);
  background-color: var(--v-theme-surface);
  color: var(--v-theme-on-surface);
  text-decoration: none;
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover:not(.active):not(.disabled) {
    background-color: var(--v-theme-grey-lighten-2);
  }

  &.active {
    pointer-events: none;
    background-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
    border-color: rgb(var(--v-theme-primary));
  }

  &.disabled {
    color: var(--v-theme-grey-darken-1);
    pointer-events: none;
    opacity: 0.5;
  }
}

.ellipsis {
  padding: 6px 10px;
  font-size: 14px;
  color: var(--v-theme-grey-darken-2);
}

.pagination-input :deep(.v-field) {
  height: 30px;
  min-height: 30px;
  width: 70px;
}

@media (max-width: 600px) {
  .page-btn {
    min-width: 28px;
    height: 28px;
    font-size: 12px;
    padding: 0 4px;
  }

  .ellipsis {
    padding: 4px 8px;
    font-size: 12px;
  }
}

:deep(.input-paginate .v-input__control) {
  height: 32px;
}
</style>
