<script setup lang="ts">
import { getNoteFeeds, getStarFeeds, getLikeFeeds } from "@/service/user";
import { useNoteDialog } from "@/hooks/useNoteDialog";
import useVariable from "@/composables/useVariable";
import { screenMode } from "@/hooks/useScreenMode";

const { route } = useVariable();
const noteDialog = useNoteDialog();

const state = reactive({
  isOpen: false,
  data: [] as EmptyArrayType[],
  qrcodeUrl: "",
  loading: false,
  isNomore: false,
  isLoadmore: false,
  page: 1,
  limit: 30,
  currentType: "note",
  title: "",
});

const id = computed(() => Number(route.params.id));
const exploreContainerRef = ref<{ element: HTMLElement } | null>(null);
const pageWrapperRef = ref<HTMLElement | null>(null);

// 🚧 NEW FLAG to control scroll activation
const infiniteActive = ref(false);

// -------------------- Data Loaders --------------------
const getRes = {
  noteFeeds: async () => {
    state.loading = true;
    try {
      const request = {
        id: id.value,
        page: state.page,
        limit: state.limit,
      };
      const res = await getNoteFeeds(request);
      if (res.errcode === 0 && res.data) {
        state.data = [...state.data, ...res.data];
        if (!res.data.length) state.isNomore = true;
      }
    } catch (e) {
      console.log(e);
    } finally {
      state.loading = false;
    }
  },
  starFeeds: async () => {
    state.loading = true;
    try {
      const request = {
        id: id.value,
        page: state.page,
        limit: state.limit,
      };
      const res = await getStarFeeds(request);
      if (res.errcode === 0 && res.data) {
        state.data = [...state.data, ...res.data];
        if (!res.data.length) state.isNomore = true;
      }
      if (!res.data?.length) state.isNomore = true;
    } catch (e) {
      console.log(e);
    } finally {
      state.loading = false;
    }
  },
  likeFeeds: async () => {
    state.loading = true;
    try {
      const request = {
        id: id.value,
        page: state.page,
        limit: state.limit,
      };
      console.log(request);
      const res = await getLikeFeeds(request);
      if (res.errcode === 0 && res.data.length) {
        state.data = [...state.data, ...res.data];
      }
      if (!res.data?.length) state.isNomore = true;
    } catch (e) {
      console.log(e);
    } finally {
      state.loading = false;
    }
  },
};

// -------------------- Handlers --------------------
const handle = {
  clickFeed(feed: any) {
    noteDialog.openNoteDialog(feed.id);
  },
};

const onLoadMore = async () => {
  if (
    !infiniteActive.value || // 🧩 prevent early trigger
    state.loading ||
    state.isLoadmore ||
    state.isNomore
  )
    return;

  state.isLoadmore = true;
  state.page++;

  try {
    switch (state.currentType) {
      case "note":
        await getRes.noteFeeds();
        break;
      case "star":
        await getRes.starFeeds();
        break;
      case "like":
        await getRes.likeFeeds();
        break;
      // case "follow":
      //   await getRes.followFeeds();
      //   break;
    }
  } finally {
    state.isLoadmore = false;
  }
};
/**
 * Called by Vuetify's v-intersect when the sentinel div
 * enters the viewport.
 */
function onIntersect(isIntersecting: boolean) {
  if (!isIntersecting) return;
  // guard: only load more when needed
  if (!state.isNomore && !state.isLoadmore && !state.loading) {
    onLoadMore();
  }
}
onMounted(() => {

});
onBeforeRouteLeave((to, from, next) => {
  if (state.isOpen) {
    state.isOpen = false;
    next(false);
  } else {
    // allow navigation
    next();
  }
});
// -------------------- Public Method --------------------
defineExpose({
  open: async (item: EmptyObjectType) => {
    state.data = [];
    state.page = 1;
    state.isNomore = false;
    state.isLoadmore = false;
    state.currentType = item.value;
    state.isOpen = true;
    state.title = item.name || "";

    infiniteActive.value = false; // 🚫 disable until data loaded

    // Initial Load
    if (item.value === "note") await getRes.noteFeeds();
    if (item.value === "star") await getRes.starFeeds();
    if (item.value === "like") await getRes.likeFeeds();

    // ✅ enable infinite scroll only after first load
    nextTick(() => {
      infiniteActive.value = true;
    });
  },
});
</script>

<template>
  <!-- QR Code Dialog -->
  <v-dialog v-model="state.isOpen" scrollable :fullscreen="screenMode === 'phone'" max-width="1200">
    <v-card class="main-contain" flat>
      <v-card-title class="pb-0">
        <v-btn icon="mdi-chevron-left" flat density="comfortable" @click="state.isOpen = false" style="
            position: absolute;
            top: 10px;
            left: 10px;
            padding-top: var(--safe-area-inset-top, 0px);
          ">
          <v-icon></v-icon>
        </v-btn>
        <!-- Title -->
        <div class="text-center text-md-h6 mb-2">{{ state.title }}</div>
      </v-card-title>

      <v-card-text class="px-4 pt-0">
        <div class="page-wrapper" ref="pageWrapperRef">
          <ExploreContainer ref="exploreContainerRef" :items="state.data" :is-load-more="state.isLoadmore"
            :is-no-more="state.isNomore" :scroll-container="pageWrapperRef" @click-item="handle.clickFeed" />
        </div>
        <div v-if="!state.isNomore && state.data.length > 0" class="load-more-sentinel" v-intersect="{
          handler: onIntersect,
          options: {
            // start loading just before reaching the very bottom
            rootMargin: '0px 0px 0px 0px',
            threshold: 0.1,
          },
        }" />
      </v-card-text>

    </v-card>
  </v-dialog>
</template>
<style scoped lang="scss">
.main-contain {
  // padding-top: env(safe-area-inset-top, 0px);
  padding-top: var(--safe-area-inset-top, 0px);
  min-height: 500px;
}

.page-wrapper {
  position: relative;
  width: 100%;

  max-height: calc(100vh - 100px);
  overflow-y: auto;
  scrollbar-width: none;
}
</style>
