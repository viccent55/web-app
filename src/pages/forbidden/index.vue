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
  const { smAndDown } = useDisplay();
  // 1 Load category list
  const getAllCategories = async () => {
    state.loading = true;
    try {
      const response: EmptyObjectType = await getCategories();
      const cats = response.data ?? [];
      state.categories = [{ id: 0, name: "全部" }, ...cats];
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
        visitor: storeUser.visitCode,
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
    if (state.loading || state.isNomore || state.data.length >= state.total)
      return;
    state.loadmore = true;
    state.page++;
    const newFeeds = await fetchData();
    if (newFeeds?.length) {
      state.data = [...state.data, ...newFeeds];
    } else {
      state.isNomore = true;
    }
  };

  /* ---------------------------
   5. Click handlers / dialog
---------------------------- */
  const noteDialog = useNoteForbidden();
  const clickFeed = (item: EmptyObjectType) => {
    clearQuery();
    noteDialog.openNoteDialog(item.id);
  };

  // rule overlay logic
  const shouldShowRuleDialog = computed(
    () => !storeUser.isLogin || (storeUser.userInfo?.invite_count ?? 0) < 5
  );
  const isVisible = computed({
    get: () => shouldShowRuleDialog.value,
    set: () => (storeUser.isLogin ? false : false),
  });

  watch(
    () => state.statusCode,
    (newCode) => {
      if (newCode === 403) isVisible.value = true;
    }
  );

  /**
   * Called by Vuetify's v-intersect when the sentinel div
   * enters the viewport.
   */
  function onIntersect(isIntersecting: boolean) {
    if (!isIntersecting) return;
    // guard: only load more when needed
    if (!state.isNomore && !state.loadmore && !state.loading) {
      onLoadMore();
    }
  }
  const onRefresh = async () => {
    state.page = 1;
    state.isNomore = false;
    state.data = [];
    state.data = await fetchData();
  };
  onMounted(async () => {
    await getAllCategories();
    if (storeUser.isLogin && storeUser.userInfo?.invite_count >= 3) {
      const items = await fetchData(); // ✅ assign result
      state.data = items; // ✅ initial list filled
    }
  });
</script>
<template>
  <v-container
    class="d-flex flex-column pa-0"
    fluid
  >
    <v-card
      flat
      color="transparent"
      :loading="state.loading"
    >
      <v-card-title class="px-0">
        <v-tabs
          v-model="state.cid"
          color="primary"
          class="category-tabs flex-shrink-0"
          density="compact"
          show-arrows
          @update:model-value="onCategoryChange"
        >
          <v-tab
            v-for="(item, index) in state.categories"
            :key="index"
            :value="item.id"
            class="px-0 custom-tab"
          >
            {{ item?.name }}
          </v-tab>
        </v-tabs>
      </v-card-title>

      <v-card-text class="px-3 px-md-0 page-content-container">
        <div
          v-if="!state?.data?.length && !isVisible && !state.loading"
          class="text-center"
        >
          <v-btn
            @click="onCategoryChange"
            color="primary"
            rounded="xl"
            prepend-icon="mdi-refresh"
          >
            刷新
          </v-btn>
        </div>
        <v-row :dense="smAndDown">
          <v-col
            v-for="(item, index) in state.data"
            :key="index"
            cols="6"
            sm="4"
            md="4"
            lg="3"
            class="col-lg-1-5"
          >
            <ExploreFeed
              :feed="item"
              @click="clickFeed(item)"
            />
          </v-col>
          <!-- Loading / Load More Indicator -->
          <v-col
            cols="12"
            class="text-center"
          >
            <ExploreLoading :loading="state.loading || state.loading" />
          </v-col>
          <v-col
            cols="12"
            v-if="state.data.length >= state.total"
          >
            <div class="d-flex justify-center align-center text-center py-4">
              <v-empty-state
                title="没有更多了"
                text="暂无内容"
              />
            </div>
          </v-col>
          <v-col cols="12">
            <div
              v-if="!state.isNomore && state.data.length > 0"
              class="load-more-sentinel pb-5 pb-md-3"
              v-intersect="{
                handler: onIntersect,
                options: {
                  // start loading just before reaching the very bottom
                  rootMargin: '0px 0px 0px 0px',
                  threshold: 0.1,
                },
              }"
            />
          </v-col>
        </v-row>
        <v-overlay
          style="display: flex; justify-content: center; align-items: center"
          v-model="isVisible"
          contained
          :opacity="0.95"
          persistent
        >
          <ForbiddenRuleDialog />
        </v-overlay>
      </v-card-text>
    </v-card>
    <v-fab
      class="fab"
      icon="mdi-refresh"
      color="primary"
      size="small"
      @click="onRefresh"
    />
  </v-container>
</template>
<style scoped lang="scss">
  .page-content-container {
    // height: 100%;
    min-height: 80vh;
  }
</style>
