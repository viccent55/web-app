<script setup lang="ts">
import { getCurrentDomain } from "@/service";
import type { ExploreFeedInfo } from "@/types/info";
import { like, getExploreFeeds, search } from "@/service/explore";
import { useNoteDialog } from "@/hooks/useNoteDialog";
import { checkPermissions } from "@/hooks/usePermisions";
import { PERMISSION } from "@/common/permision";
import { openPage } from "@/service";
import { itemAdClick } from "@/service/advert";
import useVariable from "@/composables/useVariable";

const noteDialog = useNoteDialog();
const { clearQuery, route, store, storeUser, debounce } = useVariable();

const state = reactive({
  feeds: [] as ExploreFeedInfo[],
  isLoadMore: false,
  isNoMore: false,
  loading: false,
  page: 1,
  limit: 30,
});

/* ---------------------------
   Fetch function
---------------------------- */
async function fetchFeeds(page: number): Promise<ExploreFeedInfo[]> {
  if (page > 1) {
    state.isLoadMore = true;
  } else {
    state.loading = true;
  }

  try {
    const request = {
      visitor: storeUser.visitCode,
      page,
      limit: state.limit,
      category: route.params.id ?? null,
    };

    const response = await getExploreFeeds(request);
    return response.data || [];
  } catch (err) {
    console.error("fetchFeeds failed:", err);
    state.isNoMore = true;
    return [];
  } finally {
    state.loading = false;
    state.isLoadMore = false;
  }
}

/* ---------------------------
   Initial load / reset
---------------------------- */
async function resetAndFetch() {
  state.page = 1;
  state.isNoMore = false;
  state.isLoadMore = false;
  const feeds = await fetchFeeds(1);
  if (!feeds.length) {
    state.isNoMore = true;
    return;
  }
  state.feeds = feeds;
}

/* ---------------------------
   Infinite Scroll (from ExploreContainer)
---------------------------- */
const onLoadMore = async () => {
  if (state.loading || state.isLoadMore || state.isNoMore) return;
  state.page += 1;
  const newFeeds = await fetchFeeds(state.page);

  if (newFeeds?.length) {
    // ✅ immutable update (works well with masonry-wall)
    state.feeds = [...state.feeds, ...newFeeds];
  } else {
    state.isNoMore = true;
  }
};

/* ---------------------------
   Click handlers
---------------------------- */
const handle = {
  clickFeed(item: ExploreFeedInfo) {
    if (item.mode === 3) {
      itemAdClick(item.id);
    } else {
      clearQuery();
      noteDialog.openNoteDialog(item.id);
    }
  },
  clickLike(item: ExploreFeedInfo) {
    checkPermissions(PERMISSION.User, () => {
      like({ id: item.id }).then((res) => {
        if (res.code !== 200) return;
        item.isLiked = !item.isLiked;
        item.likeCount += item.isLiked ? 1 : -1;
      });
    });
  },
  clickAuthor(item: ExploreFeedInfo) {
    openPage(`${getCurrentDomain()}/#/user/${item.id}`);
  },
};

/* ---------------------------
   Search
---------------------------- */
const searchParam = async () => {
  if (!store.search) return;
  try {
    const response = await search({ keyword: store.search });
    const data = response.data;
    state.feeds = data ?? [];
    state.page = 1;
    state.isNoMore = true; // or false if backend supports paging in search
  } catch (e) {
    console.log(e);
  }
};

const debouncedSearch = debounce(searchParam, 500);

watch(
  () => store.search,
  async (v, oldValue) => {
    if (v && route.path === "/") {
      debouncedSearch();
    } else if (!v && route.path === "/" && oldValue) {
      await resetAndFetch();
    }
  }
);

/* ---------------------------
   Public API for parent
---------------------------- */
defineExpose({
  initialize: async () => {
    await resetAndFetch();
  },
});
// onMounted(async () => {
//   await resetAndFetch();
// });
</script>

<template>
  <v-container ref="containerRef" class="pa-0 page-content-container" fluid>
    <ExploreContainer :items="state.feeds" :is-loading="state.loading" :is-load-more="state.isLoadMore"
      :is-no-more="state.isNoMore" @click-item="handle.clickFeed" @load-more="onLoadMore" />
  </v-container>
</template>

<style scoped lang="scss">
.page-content-container {
  height: 100%;
  max-height: calc(100vh - 150px);
  display: flex;
  flex-direction: column;
  /* make this element scrollable */
  overflow: auto;
}
</style>
