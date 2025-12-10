<script setup lang="ts">
import useVariable from '@/composables/useVariable';
import { adsClick } from "@/service/advert";
import { screenMode } from "@/hooks/useScreenMode";
import type { ExploreChannelItem } from '@/types/item';

defineProps<{
  items: ExploreChannelItem[];
  activeValue: string | number;
}>();

const { store, route, router } = useVariable();
const selected = ref(route.params.id || "001");
const emit = defineEmits(["click-item"]);


const onNavigate = (item: EmptyObjectType) => {
  emit("click-item", item);
  router.push(item.value == "001" ? "/" : `/category/${item.value}`);
  selected.value = item.value;
};

const itemClick = (app: any) => {
  adsClick(app.id);
};

</script>


<template>
  <div>
    <!-- Channel Bar -->
    <v-slide-group ref="group" center-active v-model="selected" show-arrows class="flex-grow-1  pb-0 custom-slide">
      <v-slide-group-item v-for="(item, index) in items" :key="index" :value="item.value">
        <v-btn :color="activeValue == item.value ? 'primary' : undefined"
          :variant="activeValue == item.value ? 'flat' : 'text'" rounded="xl" class="mt-1 mr-2 px-3 px-md-4"
          @click="onNavigate(item)" :density="screenMode === 'phone' ? 'compact' : 'default'">
          <span class="text-xs pa-0 ma-0 text-body-2 ">{{ item.name }}</span>
        </v-btn>
      </v-slide-group-item>
    </v-slide-group>
    <!-- Ads Grid -->
    <div class="gap-1 mb-3">
      <a v-for="(app, index) in store?.homeAds" :key="index" :href="app.url" target="_blank" rel="noopener noreferrer"
        class="flex flex-col items-center space-y-2 hover:opacity-80" @click="itemClick(app)" v-show="index < 10">
        <AdvertSlot :advert="{ title: app.name, image: app.image, url: app?.url }" fit="cover"
          style="width: 55px; height: 55px" />
        <span class="text-xs info">{{ app.name }}</span>
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss">
.channel-bar-container {
  display: flex;
  align-items: center;

  width: 100%;

  .arrow-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0 8px;
    color: var(--v-theme-primary);
    flex-shrink: 0;
  }

  .channel-scrollbar {
    flex-grow: 1;

    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}

:deep(.custom-slide) {

  .v-slide-group__next,
  .v-slide-group__prev {
    flex: 0 1 40px;
    min-width: 40px;
  }
}
</style>
