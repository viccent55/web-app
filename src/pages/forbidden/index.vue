<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted, nextTick } from "vue";
import { useDisplay } from "vuetify";

import useVariable from "@/composables/useVariable";
import { useNoteForbidden } from "@/hooks/useNoteForbiddenDialog";
import { select, getCategories } from "@/service/forbidden";
import ForbiddenRuleDialog from "@/components/forbidden/RuleDialog.vue";

const state = reactive({
  data: [] as EmptyArrayType,
  page: 1,
  limit: 30,
  isNomore: false,
  loadmore: false,
  total: 0,
  cid: 0,
  categories: [] as EmptyArrayType,
  loading: false,
  keyword: "",
  statusCode: null as number | null,
});

const { clearQuery, store, storeUser, formatDate } = useVariable();
const pageWrapperRef = ref<HTMLElement | null>(null);

// 1 Load category list
const getAllCategories = async () => {
  state.loading = true;
  try {
    const response: EmptyObjectType = await getCategories();
    const cats = response.data ?? [];
    state.categories = [
      { id: 0, name: "全部" },
      ...cats,
    ];
  } catch (e) {
    console.log(e);
  } finally {
    state.loading = false;
  }
};

/* ---------------------------
   2. Centralized fetch function
---------------------------- */
const fetchData = async () => {
  state.loading = true;
  try {
    const request: EmptyObjectType = {
      page: state.page,
      limit: state.limit,
      keyword: state.keyword,
    };
    if (state.cid !== 0) {
      request.cid = state.cid;
    }
    const response: EmptyObjectType = await select(request);
    state.total = response?.data?.count || 0;
    state.statusCode = response?.errcode ?? null;
    const newItems = response.data?.items?.map((item: EmptyObjectType) => ({
      ...item,
      author: { name: formatDate(item.created_at) },
    }));

    if (newItems?.length > 0) {
      return newItems;
    } else {
      state.isNomore = true;
      return [];
    }
  } finally {
    state.loading = false;
    state.loadmore = false;
  }
};

/* ---------------------------
   3. Category change
---------------------------- */
const onCategoryChange = async () => {
  state.page = 1;
  state.data = [];
  state.isNomore = false;

  const items = await fetchData();
  state.data = items;

  if (pageWrapperRef.value) {
    pageWrapperRef.value.scrollTop = 0;
  }
};

/* ---------------------------
   4. Load more (infinite scroll)
---------------------------- */
const onLoadMore = async () => {
  if (state.loading || state.isNomore || state.data.length >= state.total) return;

  const scrollEl = pageWrapperRef.value;
  const savedScrollTop = scrollEl?.scrollTop ?? 0;

  state.loadmore = true;
  state.page++;

  const newFeeds = await fetchData();
  if (newFeeds?.length) {
    state.data = [...state.data, ...newFeeds];
  } else {
    state.isNomore = true;
  }

  await nextTick();
  requestAnimationFrame(() => {
    if (scrollEl) {
      scrollEl.scrollTop = savedScrollTop;
    }
  });
};

/* ---------------------------
   5. Click handlers / dialog
---------------------------- */
const noteDialog = useNoteForbidden();
const clickFeed = (item: EmptyObjectType) => {
  clearQuery();
  noteDialog.openNoteDialog(item.id);
};

const { smAndDown } = useDisplay();

// rule overlay logic
const shouldShowRuleDialog = computed(
  () => !storeUser.isLogin || (storeUser.userInfo?.invite_count ?? 0) < 5
);
const isVisible = ref(shouldShowRuleDialog.value);

watch(
  () => state.statusCode,
  (newCode) => {
    if (newCode === 403) isVisible.value = true;
  }
);

/* ---------------------------
   6. Initial load
---------------------------- */
onMounted(async () => {
  await getAllCategories();

  if (storeUser.isLogin) {
    const items = await fetchData();     // ✅ assign result
    state.data = items;                  // ✅ initial list filled
  }
});
</script>
<template>
  <v-container class="d-flex flex-column pa-0" fluid>
    <v-card flat color="transparent" :loading="state.loading">
      <v-card-title class="px-0">
        <v-tabs v-model="state.cid" color="primary" class="category-tabs flex-shrink-0" density="compact" show-arrows
          @update:model-value="onCategoryChange">
          <v-tab v-for="(item, index) in state.categories" :key="index" :value="item.id" class="px-0 custom-tab">
            {{ item?.name }}
          </v-tab>
        </v-tabs>
      </v-card-title>

      <v-card-text class="px-3 px-md-0 position-relative">
        <div v-if="!state?.data?.length && !isVisible && !state.loading" class="text-center">
          <v-btn @click="onCategoryChange" color="primary" rounded="xl" prepend-icon="mdi-refresh">
            刷新
          </v-btn>
        </div>
        <ExploreContainer ref="exploreContainerRef" :items="state.data" :is-loading="state.loading"
          :is-load-more="state.loadmore" :is-no-more="state.isNomore" @click-item="clickFeed" @get-more="onLoadMore" />
        <v-overlay style="display: flex; justify-content: center; align-items: center" v-model="isVisible" contained
          :opacity="0.95" persistent>
          <ForbiddenRuleDialog />
        </v-overlay>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<style scoped lang="scss">
.position-relative {
  min-height: 80vh;
}
</style>