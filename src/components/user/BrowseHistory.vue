<script lang="ts" setup>
import { reactive, onMounted } from "vue";
import { getHistories } from "@/service/user";
import { useNoteDialog } from "@/hooks/useNoteDialog";
import useVariable from "@/composables/useVariable";
import { screenMode } from "@/hooks/useScreenMode";
import { useDisplay } from "vuetify";

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
  // ❌ you had this true, so sentinel never showed
  isNomore: false,
});

const { storeUser } = useVariable();
const { smAndDown } = useDisplay();
const noteDialog = useNoteDialog();

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
      const rawItems = res.data.items || [];

      const items = rawItems.map((item: EmptyObjectType) => ({
        ...item,
        cover: item.content?.thumbnail,
        mode: item.content_type,
        title: item.content?.title,
        id: item.content?.content_id,
        like_count: item.content?.plays,
      }));

      // ✅ append items
      state.data = [...state.data, ...items];

      // ✅ set total from server if exists
      if (typeof res.data.total === "number") {
        state.total = res.data.total;
      }

      const receivedCount = items.length;

      // ✅ if fewer than requested OR total reached -> no more
      if (
        receivedCount < request.limit ||
        (state.total > 0 && state.data.length >= state.total)
      ) {
        state.isNomore = true;
      } else {
        state.isNomore = false;
      }
    }
  } catch (e) {
    console.log(e);
  } finally {
    state.loading = false;
  }
};

const onLoadMore = async () => {
  // alert(2) // 🔧 remove debug alert
  if (state.loading || state.isLoadmore || state.isNomore) return;

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
 * enters the scroll root (dialog body)
 */
function onIntersect(isIntersecting: boolean) {
  // simple debug if you want:
  // console.log("sentinel intersect:", isIntersecting);

  if (!isIntersecting) return;

  if (!state.isNomore && !state.isLoadmore && !state.loading) {
    onLoadMore();
  }
}

const openDialog = () => {
  state.isDialogOpen = true;
  // reset paging when open dialog
  state.page = 1;
  state.data = [];
  state.isNomore = false;
  getHistoriesList();
};

const clickFeed = (feed: any) => {
  noteDialog.openNoteDialog(feed.id);
};

onMounted(() => {
  state.page = 1;
  state.data = [];
  state.isNomore = false;
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

    <!-- small horizontal list -->
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

    <!-- dialog with infinite scroll -->
    <v-dialog v-model="state.isDialogOpen" scrollable :fullscreen="screenMode === 'phone'" max-width="1200">
      <v-card class="main-contain" flat>
        <v-card-title class="d-flex align-center">
          <v-btn icon="mdi-chevron-left" flat density="comfortable" @click="state.isDialogOpen = false" class="mr-2" />
          浏览记录
        </v-card-title>

        <v-card-text class="page-wrapper">
          <v-row :dense="smAndDown">
            <v-col v-for="(item, index) in state.data" :key="index" cols="6" sm="4" md="4" lg="3">
              <ExploreFeed :feed="item" @click="clickFeed(item)" />
            </v-col>

            <!-- Loading / Load More Indicator -->
            <v-col cols="12" class="text-center">
              <ExploreLoading :loading="state.loading || state.isLoadmore" />
            </v-col>

            <!-- No more state -->
            <v-col cols="12" v-if="state.isNomore && state.data.length > 0">
              <div class="d-flex justify-center align-center text-center py-4">
                <v-empty-state title="没有更多了" text="暂无内容" />
              </div>
            </v-col>

            <!-- Infinite scroll sentinel -->
            <v-col cols="12">
              <div v-if="!state.isNomore && state.data.length > 0" class="load-more-sentinel pb-5 pb-md-3" v-intersect="{
                handler: onIntersect,
                options: {
                  // 👇 use dialog body as scroll root
                  rootMargin: '0px 0px 0px 0px',
                  threshold: 0.1,
                },
              }" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped lang="scss">
.page-wrapper {
  position: relative;
  width: 100%;
  /* 👇 make the dialog content actually scrollable */
  overflow-y: auto;
}

.main-contain {
  min-height: 500px;
}
</style>
