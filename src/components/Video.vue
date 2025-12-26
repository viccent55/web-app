<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch } from "vue";
  import Hls from "hls.js";
  import { useDecryption } from "@/composables/useDecryption";

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
    poster: {
      type: String,
      default: () => "",
    },
  });

  const { decryptImage, decryptedImage } = useDecryption();
  const videoPlayer = ref<HTMLVideoElement | null>(null);
  let hls: Hls | null = null;
  const displayHeight = computed(() => props.height);
  const initializePlayer = async () => {
    await decryptImage(props.poster);
    if (hls) {
      hls.destroy();
      hls = null;
    }

    if (Hls.isSupported() && videoPlayer.value) {
      hls = new Hls({
        // =============================
        // 🐢 Slow network optimizations
        // =============================
        manifestLoadingTimeOut: 15000, // 15s
        manifestLoadingMaxRetry: 3,
        manifestLoadingRetryDelay: 3000,

        levelLoadingTimeOut: 15000,
        levelLoadingMaxRetry: 3,
        levelLoadingRetryDelay: 3000,

        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 4,
        fragLoadingRetryDelay: 3000,

        // =============================
        // 🎥 Playback behavior
        // =============================
        startLevel: -1, // auto (usually lowest first)
        capLevelToPlayerSize: true,
        enableWorker: true,

        // =============================
        // 🧠 Stability
        // =============================
        lowLatencyMode: false,
        backBufferLength: 30,
      });

      hls.loadSource(props.src);
      hls.attachMedia(videoPlayer.value);

      // Manifest ready
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (props.autoplay) {
          videoPlayer.value?.play().catch(() => {});
        }
      });

      // =============================
      // ❗ Robust error handling
      // =============================
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn("[HLS ERROR]", data);

        if (!data.fatal) return;

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error("Network error → retrying load()");
            hls?.startLoad();
            break;

          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error("Media error → recoverMediaError()");
            hls?.recoverMediaError();
            break;

          default:
            console.error("Unrecoverable error → destroy");
            hls?.destroy();
            hls = null;
            break;
        }
      });

      // =============================
      // ⏱ Detect MANIFEST stuck (manual)
      // =============================
      const manifestTimeout = setTimeout(() => {
        if (!videoPlayer.value?.readyState) {
          console.error("Manifest load timeout → destroy HLS");
          hls?.destroy();
          hls = null;
        }
      }, 20000); // 20s hard limit

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        clearTimeout(manifestTimeout);
      });
    }

    // =============================
    // 🍎 Safari native HLS fallback
    // =============================
    else if (
      videoPlayer.value &&
      videoPlayer.value.canPlayType("application/vnd.apple.mpegurl")
    ) {
      videoPlayer.value.src = props.src;

      videoPlayer.value.addEventListener(
        "loadedmetadata",
        () => {
          if (props.autoplay) {
            videoPlayer.value?.play().catch(() => {});
          }
        },
        { once: true }
      );

      // Safari safety timeout
      setTimeout(() => {
        if (videoPlayer.value?.readyState === 0) {
          console.error("Safari HLS load timeout");
          videoPlayer.value.src = "";
        }
      }, 20000);
    } else {
      console.error("HLS not supported");
    }
  };

  onMounted(async () => {
    if (props.src) {
      await decryptImage(props.poster);
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
      :poster="decryptedImage"
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
