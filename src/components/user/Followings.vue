<script lang="ts" setup>
import useVariable from "@/composables/useVariable";
import { screenMode } from "@/hooks/useScreenMode";
import { getFollowFeed } from "@/service/user";

const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({}),
  },
});
const state = reactive({
  isOpen: false,
  data: [] as EmptyObjectType[],
  loading: false,
  isNomore: false,
  isLoadmore: false,
  page: 1,
  limit: 30,
  currentType: "note",
  total: 0,
});

const { formatDate, router } = useVariable();

const getFollowing = async () => {
  try {
    const res = await getFollowFeed({
      page: state.page,
      limit: state.limit,
    });
    state.total = res.data?.count || 0;
    if (state.page === 1) {
      state.data = res.data?.items || [];
    } else {
      state.data.push(...res.data?.items);
    }
  } catch (e) {
    console.log(e);
  } finally {
    state.loading = false;
  }
};

const onLoadMore = async () => {
  if (state.loading || state.isLoadmore || state.isNomore) return;
  state.isLoadmore = true;
  state.page++;
  await getFollowing();
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
defineExpose({
  open: () => {
    state.isOpen = true;
    getFollowing();
  },
});
</script>

<template>
  <v-dialog v-model="state.isOpen" scrollable :fullscreen="screenMode === 'phone'" max-width="750">
    <v-card flat class="main-contain">
      <v-card-title class="pb-0">
        <v-btn icon="mdi-chevron-left" flat density="comfortable" @click="state.isOpen = false" style="
            position: absolute;
            top: 10px;
            left: 10px;
          ">
          <v-icon></v-icon>
        </v-btn>
        <!-- Title -->
        <div class="text-center text-md-h6 mb-2">关注</div>
      </v-card-title>

      <v-card-text class="px-4 pt-0">
        <!-- Invite List -->
        <v-row dense>
          <v-col v-for="(item, i) in state.data" :key="i" cols="12" class="mb-2">
            <v-card rounded="lg" color="surface" class="pa-3 d-flex ga-5 align-center justify-space-between">
              <div class="d-flex align-center">
                <v-avatar class="me-3 cursor-pointer" density="comfortable" :size="screenMode === 'phone' ? 40 : 60"
                  @click="
                    () => {
                      state.isOpen = false;
                      router.push(`/user/${item.member?.id}`);
                    }
                  ">
                  <Image :src="item.member?.avatar || ''" cover />
                </v-avatar>
                <div class="d-flex flex-column">
                  <span class="text-body-1">
                    {{ item.member.nickname || "--" }}
                  </span>
                  <span class="text-body-2">
                    {{ item.member.slogan || "--" }}
                  </span>
                </div>
              </div>
              <span class="text-body-2">
                {{ formatDate(item.created_at, "DD/MM/YYYY ") }}
              </span>
            </v-card>
          </v-col>

          <v-col v-if="!state.data.length && !state.loading" cols="12" align="center">
            <v-empty-state title="空头支票" text="请邀请您的朋友!" />
          </v-col>
        </v-row>
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
