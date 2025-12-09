<script lang="ts" setup>
import { getHistories } from "@/service/user";
import { useNoteDialog } from "@/hooks/useNoteDialog";
import useVariable from "@/composables/useVariable";
import { screenMode } from "@/hooks/useScreenMode";

const state = reactive({
  isDialogOpen: false,
  data: [] as EmptyArrayType,
  page: 1,
  limit: 20,
  visitor: "",
  platform: 1,
  keyword: "",
  total: 0,
  loading: false,
  isLoadmore: false,
  isNomore: true,
});
const { storeUser } = useVariable();
const pageWrapperRef = ref<HTMLElement | null>(null);
const infiniteActive = ref(false);

const getHistoriesList = async () => {
  try {
    state.loading = true;
    const request = {
      page: state.page,
      limit: state.page === 1 ? 10 : 30, // load more with 30
      visitor: storeUser.visitCode,
    };
    const res = await getHistories(request);
    if (res.errcode === 0 && res.data) {
      const items = res.data?.items.map((item: EmptyObjectType) => ({
        ...item,
        cover: item.content?.thumbnail,
        mode: item.content_type,
        title: item.content?.title,
        id: item.content?.content_id,
        like_count: item.content?.plays,
      }));
      state.data = [...state.data, ...items];
      if (!res.data.length) state.isNomore = true;
    }
  } catch (e) {
    console.log(e);
  } finally {
    state.loading = false;
  }
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
    await getHistoriesList();
  } catch (e) {
    console.log(e);
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

const openDialog = () => {
  state.isDialogOpen = true;
  infiniteActive.value = false;
  state.data = [];
  getHistoriesList();
};

const noteDialog = useNoteDialog();
const clickFeed = (feed: any) => {
  noteDialog.openNoteDialog(feed.id);
};


onMounted(() => {

  state.data = [];
  getHistoriesList();

});
</script>
<template>
  <v-container class="px-0" fluid>
    <div class="d-flex align-center justify-space-between mt-md-3 px-3 w-100 text-subtitle-2 text-md-h6">
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-history</v-icon>
        浏览记录
      </div>
      <v-btn variant="text" density="comfortable" @click="openDialog" icon="mdi-chevron-right"></v-btn>
    </div>
    <v-card flat color="transparent" :loading="state.loading" class="pa-0">
      <v-slide-group class="mt-2 w-100" scrollable>
        <v-slide-group-item v-for="(item, i) in state.data.slice(0, 10)" :key="i">
          <v-card rounded="lg" flat color="surface" class="mx-2" style="width: 120px" @click="clickFeed(item)">
            <Image :src="item.content?.thumbnail" width="120" height="60" cover />
            <div class="text-caption text-truncate pa-1" :title="item.content?.title">
              {{ item.content?.title }}
            </div>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </v-card>
    <v-dialog v-model="state.isDialogOpen" scrollable :fullscreen="screenMode === 'phone'" max-width="1200">
      <v-card class="main-contain" flat>
        <v-card-title class="d-flex align-center">
          <v-btn icon="mdi-chevron-left" flat density="comfortable" @click="state.isDialogOpen = false" class="mr-2" />
          浏览记录
        </v-card-title>

        <v-card-text class="page-wrapper" ref="pageWrapperRef">
          <ExploreContainer ref="exploreContainerRef" :items="state.data" :is-load-more="state.isLoadmore"
            :is-no-more="state.isNomore" :scroll-container="pageWrapperRef" @click-item="clickFeed" />
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
  </v-container>
</template>

<style scoped lang="scss">
.page-wrapper {
  position: relative;
  width: 100%;

  max-height: calc(100vh - 100px);
  overflow-y: auto;
  scrollbar-width: none;
}

.main-contain {
  padding-top: var(--safe-area-inset-top, 0px);
  min-height: 500px;
}
</style>
