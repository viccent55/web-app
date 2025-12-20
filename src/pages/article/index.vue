<script setup lang="ts">
import useVariable from "@/composables/useVariable";
import ExploreLoading from "@/components/global/ExploreLoading.vue";
import { useNoteArticleDialog } from "@/hooks/useNoteArticleDialog";
import { articlList } from "@/service/article"
import { screenMode } from "@/hooks/useScreenMode";


const state = reactive({
  data: [] as EmptyArrayType,
  page: 1,
  isNoMore: false,
  loadmore: false,
  total: 0,
  loading: false,
  isLoadMore: false,
});

const { clearQuery } = useVariable();

/* ---------------------------
   1. Centralized fetch function
---------------------------- */
const fetchArticle = async () => {
  state.loading = true;
  try {
    const request = {
      page: state.page,
      limit: 30,
    };

    const response: EmptyObjectType = await articlList(request)
    state.total = response.data.count;
    if (state.page == 1 && response.data.items.length > 0) {
      return state.data = response.data.items;
    } else if (state.page > 1 && response.data.items.length > 0) {
      return state.data.push(...response.data.items);
    }
    state.isNoMore = true;

    return [];
  } catch (err) {
    console.error("fetchArticle failed:", err);
  } finally {
    state.loading = false;
  }
};


const onLoadMore = async () => {
  if (state.loading || state.data.length >= state.total) return;

  try {
    state.loadmore = true;
    state.page++;
    const data = await fetchArticle();
    if (data.items?.length) {
      state.data.push(...data.items);
    }
  } finally {
    state.loadmore = false;
  }
};

const noteDialog = useNoteArticleDialog();
const openDialog = (id: number) => {
  clearQuery();
  noteDialog.openNoteDialog(id);
};
/**
 * Called by Vuetify's v-intersect when the sentinel div
 * enters the viewport.
 */
function onIntersect(isIntersecting: boolean) {
  if (!isIntersecting) return;
  // guard: only load more when neededa
  if (!state.isNoMore && !state.isLoadMore && !state.loading) {
    onLoadMore();
  }
}
const onRefresh = () => {
  state.page = 1;
  state.isNoMore = false;
  state.data = [];
  fetchArticle();
};
onMounted(() => {
  fetchArticle()
});
</script>

<template>
  <v-container class="py-0" fluid>
    <v-card color="transparent" flat :loading="state.loading">
      <v-row :no-gutters="screenMode === 'phone'">
        <!-- Each Article Card -->
        <v-col v-for="(item, index) in state.data" :key="index" cols="12" md="6">
          <v-card flat color="surface" class="my-2 md:my-4 article-card " @click="openDialog(item.id)"
            @click.prevent="openDialog(item.id)">
            <Image :src="item.cover" :height="screenMode === 'phone' ? '160' : '260'" cover class="rounded-t-lg">
              <!-- Optional image loading placeholder -->
              <template #placeholder>
                <v-skeleton-loader type="image" />
              </template>
            </Image>

            <v-card-text class="text-center pb-md-3 pb-0 pt-2 font-weight-medium text-md-subtitle-1 text-subtitle-2">
              <span class="text-surface-variant ">{{ item.title }}</span>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Loading Indicator -->
        <v-col cols="12" class="text-center pb-16">
          <ExploreLoading :loading="state.loadmore" />
        </v-col>
      </v-row>
      <!-- Empty State -->
      <div v-if="!state.loading && state.data.length >= state.total" class="flex justify-center py-8">
        <v-empty-state headline="没有更多了" text="请稍后再查看!" icon="mdi-folder-open" />
      </div>
    </v-card>
    <div v-if="!state.isNoMore && state.data.length > 0" class="load-more-sentinel" v-intersect="{
      handler: onIntersect,
      options: {
        // start loading just before reaching the very bottom
        rootMargin: '0px 0px 0px 0px',
        threshold: 0.1,
      },
    }" />
    <v-fab class="fab" po icon="mdi-refresh" color="primary" size="small" @click="onRefresh" />
  </v-container>
</template>

<style scoped>
.article-card {
  border: none;
  transition: transform 0.2s ease;
  background-color: transparent;
}

.article-card:hover {
  transform: translateY(-2px);
}
</style>
