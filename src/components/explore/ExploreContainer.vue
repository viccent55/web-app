<script setup lang="ts">
  import { useDisplay } from "vuetify";
  import ExploreFeed from "./ExploreFeed.vue";
  import { screenMode } from "@/hooks/useScreenMode";

  const props = defineProps({
    items: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    isLoadMore: {
      type: Boolean,
      default: false,
    },
    isNoMore: {
      type: Boolean,
      default: false,
    },
  });

  const emits = defineEmits(["click-item", "load-more"]);

  const feedsContainer = ref<HTMLElement | null>(null);
  const { lg, md, smAndDown } = useDisplay();

  // Masonry layout properties
  const minColumns = computed(() => {
    if (smAndDown.value) return 2;
    if (screenMode.value === "pad") return 3;
    if (lg.value || md.value) return 4;
    return 5;
  });

  const gap = computed(() => (screenMode.value === "phone" ? 12 : 28));
  const internalGap = ref(gap.value);

  watch(gap, (newGap) => {
    internalGap.value = newGap;
  });

  const updateColumnWidth = () => {
    // Optional: use feedsContainer.value?.clientWidth
  };

  const handleItemClick = (item: any) => {
    emits("click-item", item);
  };

  /**
   * Scroll handler: when user scrolls near the bottom
   * of the internal container, emit "load-more".
   */
  const onScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    const threshold = 200; // px before bottom
    if (
      target.scrollTop + target.clientHeight >=
      target.scrollHeight - threshold
    ) {
      emits("load-more");
    }
  };
  /**
   * Called by Vuetify's v-intersect when the sentinel div
   * enters the viewport.
   */
  function onIntersect(isIntersecting: boolean) {
    if (!isIntersecting) return;
    // guard: only load more when needed
    if (!props.isNoMore && !props.isLoadMore && !props.isLoading) {
      emits("load-more");
    }
  }
  onMounted(() => {
    nextTick(() => updateColumnWidth());
    window.addEventListener("resize", updateColumnWidth);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", updateColumnWidth);
  });

  const wallVisible = ref(true);
  // For keep-alive: force redraw
  onActivated(() => {
    wallVisible.value = false;
    nextTick(() => {
      wallVisible.value = true;
    });
  });
  const isLoadingAny = computed(() => props.isLoading || props.isLoadMore);
  defineExpose({ element: feedsContainer });
</script>

<template>
  <div
    class="feeds-container"
    ref="feedsContainer"
    @scroll.passive="onScroll"
  >
    <MasonryWall
      v-if="wallVisible"
      :items="items"
      :min-columns="minColumns"
      :gap="internalGap"
      :scroll-container="feedsContainer"
      item-key="id"
      :ssr="false"
    >
      <template #default="{ item }">
        <div :data-feed-id="item.id">
          <ExploreFeed
            :feed="item"
            @click="handleItemClick(item)"
          />
        </div>
      </template>
    </MasonryWall>
    <div
      v-if="!isLoadMore && items.length > 0"
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
    <ExploreLoading
      class="pb-6 pb-md-2"
      :loading="isLoadingAny"
    />

    <div
      v-if="isNoMore"
      class="flex justify-center text-xl py-2"
    >
      <v-empty-state
        headline="不再"
        text="请稍后再查看更多数据!"
        title="没有更多数据显示"
      />
    </div>
  </div>
</template>

<style scoped>
  .feeds-container {
    width: 100%;
    flex-grow: 1;
    overflow-y: auto;
    scrollbar-width: none;
    padding-bottom: 80px;
  }

  .feeds-container::-webkit-scrollbar {
    display: none;
  }
</style>
