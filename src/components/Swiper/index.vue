<script setup lang="ts">
  import { ref } from "vue";
  import Image from "@/components/Image.vue";
  import { useDisplay } from "vuetify";
  import VideoPlayer from "@/components/Video.vue";

  const props = defineProps({
    mediaInfo: {
      type: Array as PropType<{ name: string; value: string }[]>,
      default: () => [],
    },
    height: {
      type: String,
      default: () => "100%",
    },
    contain: {
      type: Boolean,
      default: false,
    },
    lightBox: {
      type: Boolean,
      default: false,
    },
    poster: {
      type: String,
      default: () => "",
    },
  });

  const videoPlayerRef = ref<InstanceType<typeof VideoPlayer>[]>([]);
  const carousel = ref();
  const closeVideo = () => {
    videoPlayerRef.value.forEach((player) => {
      player?.closeVideo?.();
    });
  };

  const next = () => carousel.value?.next?.();
  const prev = () => carousel.value?.prev?.();
  const { smAndDown } = useDisplay();
  const heightOffset = computed(() => {
    if (smAndDown.value) return props.height;
    return `calc(100vh - 120px)`;
  });
  const lightBoxRef = useTemplateRef("light-box");
  const onOpenLightBox = (index: number) => {
    lightBoxRef.value?.open(index);
  };

  defineExpose({
    closeVideo,
    next,
    prev,
  });
</script>

<template>
  <div>
    <v-carousel
      ref="carousel"
      class="swiper"
      hide-delimiter-background
      :hide-delimiters="true"
      delimiter-icon="mdi-square"
      :show-arrows="mediaInfo?.length > 1"
      height="100%"
      color="primary"
    >
      <template #prev="{ props }">
        <v-btn
          variant="tonal"
          color="primary"
          density="comfortable"
          icon="mdi-chevron-left"
          @click="props.onClick"
        ></v-btn>
      </template>
      <template #next="{ props }">
        <v-btn
          variant="tonal"
          color="primary"
          density="comfortable"
          icon="mdi-chevron-right"
          @click="props.onClick"
        ></v-btn>
      </template>
      <v-carousel-item
        v-for="(item, index) in mediaInfo"
        :key="index"
        class="fill-height"
      >
        <Image
          v-if="item.name === 'image'"
          :src="item?.value"
          :cover="false"
          class="media"
          :style="{
            maxHeight: height,
            minHeight: height,
          }"
          @click="props.lightBox ? onOpenLightBox(index) : null"
        />

        <VideoPlayer
          v-if="item.name === 'video'"
          ref="videoPlayerRef"
          :src="item?.value"
          class="video"
          :poster="poster"
          :height="height"
        />
      </v-carousel-item>
    </v-carousel>
    <Lightbox
      v-if="mediaInfo.length > 0 && props.lightBox"
      ref="light-box"
      :sources="mediaInfo.map((item) => item.value)"
    ></Lightbox>
  </div>
</template>

<style scoped lang="scss">
  .swiper {
    width: 100%;
    max-height: calc(v-bind(heightOffset));
    // min-height: 300px;
  }

  .media {
    // height: 100%;
    object-fit: contain;
  }

  .video {
    width: 100%;
    height: 100%;
  }
</style>
