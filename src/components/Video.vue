<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch } from "vue";
  import Hls from "hls.js";
  const props = defineProps({
    src: {
      type: String,
      default: () => "",
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
      default: () => "100%",
    },
  });

  const videoPlayer = ref<HTMLVideoElement | null>(null);
  let hls: Hls | null = null;
  const displayHeight = computed(() => props.height);
  const initializePlayer = () => {
    // Clean up existing HLS instance if it exists
    if (hls) {
      hls.destroy();
      hls = null;
    }

    if (Hls.isSupported() && videoPlayer.value) {
      hls = new Hls();
      hls.loadSource(props.src);
      hls.attachMedia(videoPlayer.value);

      // Autoplay logic
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (props.autoplay) {
          videoPlayer.value?.play().catch((error) => {
            console.error("Autoplay failed:", error);
          });
        }
      });

      // Error handling
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Fatal network error. Retrying...");
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Fatal media error. Recovering...");
              hls?.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable HLS error", data);
              hls?.destroy();
              break;
          }
        }
      });
    } else if (
      videoPlayer.value &&
      videoPlayer.value.canPlayType("application/vnd.apple.mpegurl")
    ) {
      // Native HLS (Safari)
      videoPlayer.value.src = props.src;
      videoPlayer.value.addEventListener(
        "loadedmetadata",
        () => {
          if (props.autoplay) {
            videoPlayer.value?.play().catch((error) => {
              console.error("Autoplay failed:", error);
            });
          }
        },
        { once: true }
      );
    } else {
      console.error("HLS is not supported in this browser.");
    }
  };

  onMounted(() => {
    if (props.src) {
      initializePlayer();
    }
  });

  // Re-initialize if src changes
  watch(
    () => props.src,
    (newSrc) => {
      if (newSrc) {
        initializePlayer();
      }
    }
  );
  const closeVideo = () => {
    // Stop video playback
    if (videoPlayer.value) {
      videoPlayer.value.pause();
      videoPlayer.value.removeAttribute("src");
      videoPlayer.value.load();
    }
    // Destroy HLS instance if it exists
    if (hls) {
      hls.destroy();
      hls = null;
    }
  };

  defineExpose({
    closeVideo,
  });
  onBeforeUnmount(() => {
    if (hls) {
      hls.destroy();
    }
  });
</script>

<template>
  <div class="video-container">
    <video
      ref="videoPlayer"
      class="video-js"
      controls
      :muted="props.muted"
      :autoplay="props.autoplay"
      playsinline
    ></video>
  </div>
</template>

<style scoped>
  .video-container {
    width: 100%;
    height: 100%;
    margin: auto;
  }

  .video-js {
    width: 100%;
    object-fit: contain;
    height: v-bind(displayHeight);
  }
</style>
