<script setup lang="ts">
import { PERMISSION } from "@/common/permision";
import Avatar from "@/components/Avatar.vue";
import Image from "@/components/Image.vue";
import { checkPermissions } from "@/hooks/usePermisions";
import type { PropType } from "vue";
import { like } from "@/service/explore";

defineProps({
  feed: {
    type: Object as PropType<EmptyObjectType>,
    default: () => ({}),
  },
});

const onClickLike = async (feed: EmptyObjectType) => {
  checkPermissions(PERMISSION.User, () => {
    like(feed.id).then((res) => {
      if (res.errcode === 0) {
        feed.isLike = !feed.isLike;
        feed.like_count += feed.isLike ? 1 : -1;
      }
    });
  });
};

defineEmits(["click", "clickAuthor"]);
</script>

<template>
  <v-card class="feed-wrapper position-relative" elevation="0" rounded="lg" tag="a" :to="'/?noteId=' + feed.id"
    @click.prevent="$emit('click')">
    <!-- Media Section -->
    <div class="position-absolute" :style="feed.is_hot
      ? {
        zIndex: 10,
        right: '0px',
        top: '0px',
      }
      : {
        zIndex: 10,
        right: '10px',
        top: '10px',
      }
      ">
      <v-icon v-if="feed.mode === 1" icon="mdi-play-circle-outline" size="24" color="white" />
      <v-icon v-if="feed.mode === 2" icon="mdi-image-outline" size="24" color="white" />
      <div v-if="feed.mode === 3" class="ad-badge">
        广告
      </div>
      <span v-if="feed?.is_hot">
        <v-chip variant="flat" density="compact" label class="rounded-te-lg bg-purple opacity-70">
          热的
        </v-chip>
      </span>
    </div>

    <AdvertSlot @click.stop v-if="feed.mode === 3" :advert="{
      image: feed?.cover,
      url: feed?.advert?.value,
    }" :aspect-ratio="feed.cover_w / feed.cover_h" class="height-dialog" />

    <Image v-if="feed.mode !== 3" :src="feed.cover" cover
      :aspect-ratio="((feed.cover_w || 1) / (feed.cover_h || 1)) * 1.5" />

    <!-- Info Section -->
    <v-card-text class="pt-3">
      <!-- Title -->
      <div class="text-body-2 font-medium mb-2 text-surface-variant">
        {{ feed.title }}
      </div>

      <!-- Author + Like -->
      <div class="d-flex justify-space-between align-center">
        <!-- Author -->
        <div class="d-flex align-center ga-2">
          <v-chip class="px-0" @click.stop variant="text" :to="'/user/' + feed.author?.id" v-if="feed.author?.id">
            <Avatar v-if="feed.author?.avatar" :src="feed.author?.avatar" :id="feed.id" size="24" />
          </v-chip>
          <span class="text-caption text-surface-variant">
            {{ feed.author?.name || feed.author?.nickname }}
          </span>
        </div>

        <!-- Like -->
        <div class="d-flex align-center">
          <v-btn variant="text" size="small" class="px-0" disabled>
            <v-icon>mdi-heart-outline</v-icon>
            <span class="ml-1">{{ feed.like_count }}</span>
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.feed-wrapper {
  cursor: pointer;
  transition: filter 0.2s;
}

.feed-wrapper:hover {
  filter: brightness(85%);
}

.ad-badge {
  position: absolute;
  right: 0;
  z-index: 10;
  font-size: 12px;
  /* text-xs */
  font-weight: 600;
  /* font-semibold */
  padding: 2px 8px;
  /* px-2 py-0.5 (≈0.125rem * base 16 = 2px) */
  border-radius: 9999px;
  /* rounded-full */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  /* shadow */
  animation: bounce 1s infinite;
  /* animate-bounce */
  background-color: rgb(var(--v-theme-warning));
  color: white;
  display: inline-block;
  width: 44px;
}

/* Bounce animation similar to Tailwind's animate-bounce */
@keyframes bounce {

  0%,
  100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }

  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style>
