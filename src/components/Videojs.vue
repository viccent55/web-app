<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
  import videojs from "video.js";
  import "video.js/dist/video-js.css";

  const props = defineProps({
    src: {
      type: String,
      default: "",
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    muted: {
      type: Boolean,
      default: false,
    },
    height: {
      type: String,
      default: "100%",
    },
  });

  const videoEl = ref<HTMLVideoElement | null>(null);
  let player: ReturnType<typeof videojs> | null = null;

  /* ---------------------------
   * UI state
   * -------------------------- */
  const videoError = ref(false);
  const errorMessage = ref("Video unavailable");

  const displayHeight = computed(() => props.height);

  /* ---------------------------
   * init player
   * -------------------------- */
  const initPlayer = () => {
    videoError.value = false;

    if (!videoEl.value || !props.src) {
      videoError.value = true;
      errorMessage.value = "⚠️ Video not available";
      return;
    }

    if (player) {
      player.dispose();
      player = null;
    }

    player = videojs(videoEl.value, {
      autoplay: props.autoplay,
      muted: props.muted,
      controls: true,
      preload: "auto",
      responsive: true,
      fluid: false,
      playsinline: true,
      sources: [
        {
          src: props.src,
          type: "application/x-mpegURL",
        },
      ],
    });

    /* ---------------------------
     * error handling
     * -------------------------- */
    player.on("error", () => {
      const err = player?.error();
      console.error("🎬 Video.js error:", err);

      videoError.value = true;

      switch (err?.code) {
        case 2:
          errorMessage.value = "⚠️ Network error. Please try again later.";
          break;
        case 3:
          errorMessage.value = "⚠️ Video decoding failed.";
          break;
        case 4:
          errorMessage.value = "⚠️ Video format not supported.";
          break;
        default:
          errorMessage.value = "⚠️ Video cannot be played.";
      }

      // ❌ DO NOT auto-retry (prevents infinite loops)
      player?.pause();
    });
  };

  /* ---------------------------
   * lifecycle
   * -------------------------- */
  onMounted(() => {
    initPlayer();
  });

  watch(
    () => props.src,
    (newSrc) => {
      if (!newSrc) {
        videoError.value = true;
        errorMessage.value = "⚠️ Video not available";
        return;
      }

      initPlayer();
    }
  );

  const closeVideo = () => {
    if (player) {
      player.pause();
      player.dispose();
      player = null;
    }
  };

  defineExpose({ closeVideo });

  onBeforeUnmount(() => {
    if (player) {
      player.dispose();
      player = null;
    }
  });
</script>

<template>
  <div class="video-container">
    <video
      v-show="!videoError"
      ref="videoEl"
      class="video-js vjs-theme-city"
      playsinline
    ></video>

    <!-- Error Overlay -->
    <div
      v-if="videoError"
      class="video-error"
    >
      asdfasdf
      <div class="video-error__text">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .video-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
  }

  .video-js {
    width: 100%;
    height: v-bind(displayHeight);
    object-fit: contain;
  }

  /* ---------------------------
 * Error overlay
 * -------------------------- */
  .video-error {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    color: #fff;
    text-align: center;
    padding: 16px;
  }

  .video-error__text {
    font-size: 15px;
    line-height: 1.5;
    opacity: 0.85;
  }

  /* Play / pause icon */
  :deep(.video-js .vjs-play-control .vjs-icon-placeholder:before) {
    font-family: VideoJS;
    content: "\f101";
    font-size: 18px;
  }

  :deep(.video-js.vjs-playing .vjs-play-control .vjs-icon-placeholder:before) {
    content: "\f103";
  }
</style>
