<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { getNoteFeeds, getStarFeeds, getLikeFeeds } from "@/service/user";
import { useNoteDialog } from "@/hooks/useNoteDialog";
import useVariable from "@/composables/useVariable";
import { screenMode } from "@/hooks/useScreenMode";
import { useDisplay } from "vuetify";

const { route } = useVariable();
const noteDialog = useNoteDialog();

const state = reactive({
  isOpen: false,
  data: [] as EmptyArrayType[], // assuming your type alias
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
const { smAndDown } = useDisplay();

// 🚧 control when infinite scroll can start (after first load)
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
      if (res.errcode === 0 && Array.isArray(res.data)) {
        const items = res.data;
        state.data = [...state.data, ...items];

        // no more if less than requested
        if (items.length < state.limit) state.isNomore = true;
      } else {
        state.isNomore = true;
      }
    } catch (e) {
      console.log(e);
      state.isNomore = true;
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
      if (res.errcode === 0 && Array.isArray(res.data)) {
        const items = res.data;
        state.data = [...state.data, ...items];

        if (items.length < state.limit) state.isNomore = true;
      } else {
        state.isNomore = true;
      }
    } catch (e) {
      console.log(e);
      state.isNomore = true;
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
      const res = await getLikeFeeds(request);
      if (res.errcode === 0 && Array.isArray(res.data)) {
        const items = res.data;
        state.data = [...state.data, ...items];

        if (items.length < state.limit) state.isNomore = true;
      } else {
        state.isNomore = true;
      }
    } catch (e) {
      console.log(e);
      state.isNomore = true;
    } finally {
      state.loading = false;
    }
  },
};

// -------------------- Handlers --------------------
const clickFeed = (feed: any) => {
  noteDialog.openNoteDialog(feed.id);
};

const onLoadMore = async () => {
  if (state.loading || state.isLoadmore || state.isNomore) return;

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
  // console.log("sentinel intersect:", isIntersecting);
  if (!isIntersecting) return;
  if (!state.isNomore && !state.isLoadmore && !state.loading) {
    onLoadMore();
  }
}

onMounted(() => {
  // nothing special on mount here
});

onBeforeRouteLeave((to, from, next) => {
  if (state.isOpen) {
    state.isOpen = false;
    next(false);
  } else {
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

    infiniteActive.value = false; // 🚫 disable until first batch finished

    // Initial Load (based on tab)
    if (item.value === "note") await getRes.noteFeeds();
    if (item.value === "star") await getRes.starFeeds();
    if (item.value === "like") await getRes.likeFeeds();

    // ✅ enable infinite scroll only after first load + next render tick
    nextTick(() => {
      infiniteActive.value = true;
    });
  },
});
</script>

<template>
  <!-- QR Code / Feeds Dialog -->
  <v-dialog v-model="state.isOpen" scrollable :fullscreen="screenMode === 'phone'" max-width="1200">
    <v-card class="main-contain" flat>
      <v-card-title class="pb-0">
        <v-btn icon="mdi-chevron-left" flat density="comfortable" @click="state.isOpen = false" style="
            position: absolute;
            top: 10px;
            left: 10px;

          ">
          <v-icon></v-icon>
        </v-btn>
        <!-- Title -->
        <div class="text-center text-md-h6 mb-2">
          {{ state.title }}
        </div>
      </v-card-title>

      <!-- 👇 make this the scrollable body, like previous dialog -->
      <v-card-text class="px-4 pt-0 page-wrapper">
        <v-row :dense="smAndDown">
          <v-col v-for="(item, index) in state.data" :key="index" cols="6" sm="4" md="4" lg="3">
            <ExploreFeed :feed="item" @click="clickFeed(item)" />
          </v-col>

          <!-- Loading / Load More Indicator -->
          <v-col cols="12" class="text-center">
            <ExploreLoading :loading="state.loading || state.isLoadmore" />
          </v-col>
          <v-col cols="12" v-if="!state.data.length">
            <div class="d-flex justify-center align-center text-center py-4">
              <v-empty-state title="无数据" />
            </div>
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
                rootMargin: '0px 0px 0px 0px',
                threshold: 0.1,
              },
            }" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.main-contain {
  min-height: 500px;
}

.page-wrapper {
  position: relative;
  width: 100%;
  overflow-y: auto;
  scrollbar-width: none;
}
</style>
