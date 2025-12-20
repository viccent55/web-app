<script setup lang="ts">
  import { reactive, ref, computed, onMounted } from "vue";
  import { useDisplay } from "vuetify";
  import DrawerArea from "@/components/hookup/DrawerArea.vue";
  import DrawerFilter from "@/components/hookup/DrawerFilter.vue";
  import CheckPointDialog from "@/components/hookup/CheckPointDialog.vue";
  import ExploreLoading from "@/components/global/ExploreLoading.vue";
  import { getConfig, findList } from "@/service/hookup";
  import { useNoteHookupDialog } from "@/hooks/useNoteHookupDialog";
  import { checkPermissions } from "@/hooks/usePermisions";
  import { PERMISSION } from "@/common/permision";
  import useVariable from "@/composables/useVariable";

  /* --------------------------------
   1. State & basic setup
----------------------------------- */

  const { clearQuery } = useVariable();
  const noteDialog = useNoteHookupDialog();
  const { smAndDown } = useDisplay();

  const containerRef = ref<HTMLElement | null>(null);

  const state = reactive({
    // UI
    isDrawerOpen: false,
    isFilterOpen: false,
    isCheckpoint: false,

    // list data
    items: [] as EmptyArrayType,
    page: 1,
    limit: 30,
    total: 0,

    // flags
    isNoMore: false,
    isLoading: false, // generic loading
    isLoadMore: false, // when loading next page

    // filters
    filter: {
      cid: 0,
      province: null as string | null,
      city: null as string | null,
      tag_id: null as string | null,
    },

    // config for filters / drawers
    config: {} as EmptyObjectType,
  });

  /* --------------------------------
   2. Derived state
----------------------------------- */

  // Category menu from global config
  const displayMenu = computed(() => {
    return [{ id: 0, name: "全部" }, ...(state.config?.categories || [])];
  });

  /* --------------------------------
   3. API calls
----------------------------------- */

  const loadHookupConfig = async () => {
    try {
      state.isLoading = true;
      const response: EmptyObjectType = await getConfig({});
      state.config = response.data ?? {};
    } catch (err) {
      console.error("getHookupConfig failed:", err);
    } finally {
      state.isLoading = false;
    }
  };

  // core fetch for list
  const fetchList = async () => {
    try {
      state.isLoading = true;
      const req = {
        page: state.page,
        limit: state.limit,
        ...state.filter,
      };

      const res = await findList(req);

      if (res?.errcode === 0 && Array.isArray(res.data?.items)) {
        state.total = res.data.count ?? 0;
        return res.data.items as EmptyArrayType;
      }

      state.isNoMore = true;
      return [];
    } catch (err) {
      console.error("fetchList failed:", err);
      state.isNoMore = true;
      return [];
    } finally {
      state.isLoading = false;
    }
  };

  /* --------------------------------
   4. List operations
----------------------------------- */

  // Reset paging and reload first page
  const resetAndFetch = async () => {
    state.page = 1;
    state.items = [];
    state.isNoMore = false;

    // reset scroll back to top
    if (containerRef.value) {
      containerRef.value.scrollTop = 0;
    }

    const items = await fetchList();
    state.items = items;
  };

  // Load next page
  const onLoadMore = async () => {
    if (state.isLoading || state.isLoadMore || state.isNoMore) return;
    if (state.items.length >= state.total) return;

    state.isLoadMore = true;
    state.page++;

    try {
      const items = await fetchList();
      if (items.length) {
        state.items.push(...items);
      } else {
        state.isNoMore = true;
      }
    } finally {
      state.isLoadMore = false;
    }
  };

  /* --------------------------------
   5. UI actions
----------------------------------- */

  const openDialog = (id: number) => {
    clearQuery();
    noteDialog.openNoteDialog(id);
  };

  // top tabs: change CID and reload
  const onCategoryChange = () => {
    resetAndFetch();
  };

  const onDrawerSelect = (item: {
    province: string | null;
    city: string | null;
  }) => {
    state.filter.province = item.province;
    state.filter.city = item.city;
    resetAndFetch();
  };

  const onTagSelect = (tagId: string | null) => {
    state.filter.tag_id = tagId;
    resetAndFetch();
  };

  const onOpenCheckPoint = () => {
    checkPermissions(PERMISSION.User, () => {
      state.isCheckpoint = true;
    });
  };

  /**
   * Called by Vuetify's v-intersect when the sentinel div
   * enters the viewport.
   */
  function onIntersect(isIntersecting: boolean) {
    if (!isIntersecting) return;
    // guard: only load more when needed
    if (!state.isNoMore && !state.isLoadMore && !state.isLoading) {
      onLoadMore();
    }
  }

  const onRefresh = () => {
    resetAndFetch();
  };
  onMounted(async () => {
    // set default CID once menu is available
    const firstMenuItem = displayMenu.value[0];
    if (firstMenuItem) {
      state.filter.cid = firstMenuItem.id ?? 0;
    }

    await loadHookupConfig();
    await resetAndFetch();
  });
</script>

<template>
  <v-container
    class="pa-0 h-100"
    fluid
    style="height: 100%"
  >
    <v-card
      flat
      color="transparent"
    >
      <!-- Toolbar -->
      <v-card-title class="channel-bar-sticky px-0">
        <v-toolbar
          color="surface"
          density="compact"
        >
          <v-row
            dense
            align="center"
          >
            <v-col cols="4">
              <v-btn
                variant="text"
                class="px-2 ml-0 ml-md-2"
                @click="state.isDrawerOpen = true"
              >
                <div class="d-flex align-center ga-2">
                  <v-icon size="24">mdi-map-marker</v-icon>
                  <span class="text-body-1">地点</span>
                </div>
              </v-btn>
            </v-col>
            <v-col
              cols="4"
              align-self="center"
            >
              <div
                class="d-flex justify-center text-h6 text-primary font-weight-bold"
              >
                精选推荐
              </div>
            </v-col>
            <v-col cols="4">
              <div class="d-flex align-center justify-end">
                <v-btn
                  icon
                  variant="text"
                  @click="state.isFilterOpen = true"
                >
                  <v-icon>mdi-filter-variant</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-toolbar>
        <!-- Category Tabs -->
        <v-tabs
          v-model="state.filter.cid"
          color="primary"
          class="category-tabs px-0 mb-2 px-md-2"
          density="compact"
          show-arrows
          @update:model-value="onCategoryChange"
        >
          <v-tab
            v-for="item in displayMenu"
            :key="item.id"
            :value="item.id"
            class="px-0 custom-tab"
          >
            {{ item.name }}
          </v-tab>
        </v-tabs>
      </v-card-title>
      <!-- Content -->
      <v-card-text class="px-3">
        <div
          ref="containerRef"
          class="hookup-wrapper"
        >
          <v-row :dense="smAndDown">
            <v-col
              v-for="(item, index) in state.items"
              :key="index"
              cols="6"
              sm="4"
              md="4"
              lg="3"
              class="col-lg-1-5"
            >
              <v-card
                tag="a"
                flat
                rounded="lg"
                class="hookup-card"
                :to="'/hookup/' + item.id"
                @click.prevent="openDialog(item.id)"
              >
                <Image
                  :src="item?.cover"
                  min-height="200px"
                  :aspect-ratio="(180 / 280) * 1.5"
                  cover
                />
                <div class="pa-2">
                  <div class="text-surface-variant my-1">
                    {{ item?.name }}
                  </div>
                  <div>
                    最低消费:
                    <strong class="text-primary">
                      {{ item?.min_price }} 元
                    </strong>
                  </div>
                  <v-chip
                    v-for="(tag, tIndex) in item?.tags"
                    :key="tIndex"
                    size="small"
                    class="mr-1 mt-1 rounded-lg"
                    variant="tonal"
                    color="primary"
                  >
                    {{ tag?.name }}
                  </v-chip>
                </div>
              </v-card>
            </v-col>

            <!-- Loading / Load More Indicator -->
            <v-col
              cols="12"
              class="text-center"
            >
              <ExploreLoading
                class="pb-8 pb-md-3"
                :loading="state.isLoadMore || state.isLoading"
              />
            </v-col>
          </v-row>

          <!-- Empty State -->
          <div
            v-if="state.items.length >= state.total"
            class="d-flex justify-center align-center text-center pt-2 pb-6"
          >
            <v-empty-state
              title="没有更多了"
              text="暂无内容"
            />
          </div>

          <!-- Checkpoint Button -->
          <div
            class="checkpoint-btn"
            @click="onOpenCheckPoint"
          >
            <div
              class="px-2 py-3 d-flex flex-column text-white font-weight-bold f12"
            >
              <div>签到免</div>
              <div>定金</div>
            </div>
          </div>
        </div>
        <div
          v-if="!state.isNoMore && state.items.length > 0"
          class="load-more-sentinel"
          v-intersect="{
            handler: onIntersect,
            options: {
              // start loading just before reaching the very bottom
              rootMargin: '0px 0px 0px 0px',
              threshold: 0.1,
            },
          }"
        />
      </v-card-text>
      <v-fab
        class="fab"
        icon="mdi-refresh"
        color="primary"
        size="small"
        @click="onRefresh"
      />
    </v-card>

    <!-- Drawers & dialogs -->
    <DrawerArea
      v-model="state.isDrawerOpen"
      :areas="state.config?.areas"
      :hot-areas="state.config?.hot_areas"
      @select="onDrawerSelect"
    />
    <DrawerFilter
      v-model="state.isFilterOpen"
      :tags="state.config?.tags"
      @select="onTagSelect"
    />
    <CheckPointDialog v-model="state.isCheckpoint" />
  </v-container>
</template>

<style scoped lang="scss">
  .hookup-wrapper {
    position: relative;
  }

  /* Sticky channel bar */
  .channel-bar-sticky {
    position: sticky;
    padding: 0;
    z-index: 10;
    background-color: var(--v-theme-surface);
  }

  .position-absolute {
    position: absolute !important;
    bottom: 80px;
    right: 20px;
    z-index: 11;
  }

  .custom-tab {
    min-width: 60px !important;
    margin-right: 10px;
  }

  .checkpoint-btn {
    position: fixed;
    bottom: 180px;
    right: 10px;
    z-index: 11;
    @extend .point-bg; // if you use SCSS; or just copy the properties
  }

  .point-bg {
    background-image: url("/hookgirl/hookicon.png");
    width: 60px;
    border-radius: 10px;
    background-color: #8745c4;
    background-size: cover;
    background-repeat: no-repeat;
    cursor: pointer;
  }
</style>
