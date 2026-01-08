<script lang="ts" setup>
  import { useDecryption } from "@/composables/useDecryption";
  import Hls from "hls.js";
  const props = defineProps({
    content: {
      type: String,
      default: () => "",
    },
    skeleton: {
      type: Number,
      default: 4,
    },
    poster: {
      type: String,
      default: () => "",
    },
  });
  const { decryptImage, decryptedImage } = useDecryption();

  const contentRef = ref<HTMLDivElement | any>(null);
  const loading = ref(false);
  const hlsInstances = ref<any[]>([]);

  const loadingContent = computed(() => {
    if (!props.content) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(props.content, "text/html");

    // 🔥 PREVENT VIDEO FETCH DURING LOADING
    doc.querySelectorAll("video").forEach((video) => {
      video.removeAttribute("src");
      video.setAttribute("data-disabled", "true");
      video.setAttribute("preload", "none");
    });

    return doc.body.innerHTML;
  });

  const HLS_CONFIG = {
    // =============================
    // 🐢 Slow network optimizations
    // =============================
    manifestLoadingTimeOut: 15000,
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
    startLevel: -1,
    capLevelToPlayerSize: true,
    enableWorker: true,

    // =============================
    // 🧠 Stability
    // =============================
    lowLatencyMode: false,
    backBufferLength: 30,
  };

  const initImgAndVideo = async (content: string) => {
    loading.value = true;
    try {
      if (!content) return;
      // Parse content using DOMParser for images
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");

      // 🔹 decrypt images in parallel
      const images = Array.from(doc.querySelectorAll("img[data-lazy-src]"));
      await Promise.all(
        images.map(async (img: EmptyObjectType) => {
          const lazySrc = img.getAttribute("data-lazy-src");
          if (!lazySrc) return;

          try {
            const decrypted = await decryptImage(lazySrc);
            if (decrypted) {
              img.removeAttribute("data-lazy-src");
              img.src = decrypted;
            }
          } catch (err) {
            console.error("Error decrypting image:", err);
          }
        })
      );

      // Insert the parsed & decrypted content into the container
      // contentRef.value.innerHTML = "";
      Array.from(doc.body.childNodes).forEach((node) => {
        contentRef.value?.appendChild(node);
      });

      // 🔹 handle videos in the inserted content
      const videos = contentRef.value?.querySelectorAll("video");

      videos?.forEach(async (video: HTMLVideoElement) => {
        // 🚫 already handled → skip
        if (video.dataset.hlsAttached === "true") return;

        const src = video.getAttribute("src");
        if (!src) return;

        video.dataset.hlsAttached = "true"; // 🔒 permanent guard

        // style
        video.style.display = "block";
        video.style.width = "100%";
        video.style.maxHeight = "400px";
        video.style.objectFit = "contain";
        video.setAttribute("controls", "true");
        video.setAttribute("playsinline", "true");

        // ✅ POSTER FIRST
        if (props.poster && !video.hasAttribute("poster")) {
          const decryptedPoster = await decryptImage(props.poster);
          video.setAttribute("poster", decryptedPoster as string);
        }

        /* =============================
         * 🍏 Safari native HLS
         * ============================= */
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (video.src !== src) {
            video.src = src;
          }
          return;
        }

        /* =============================
         * 🌍 HLS.js
         * ============================= */
        if (!Hls.isSupported()) return;

        const hls = new Hls(HLS_CONFIG);
        hlsInstances.value.push(hls);

        hls.attachMedia(video);

        /* =============================
         * ⏱ Manifest watchdog
         * ============================= */
        const manifestTimeout = setTimeout(() => {
          if (!video.readyState) {
            console.error("⏱ Manifest load timeout → destroy HLS");
            hls.destroy();
          }
        }, 20000); // hard 20s cap

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(src);
        });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          clearTimeout(manifestTimeout);
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data.fatal) return;

          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("HLS network error → retry");
              hls.startLoad();
              break;

            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("HLS media error → recover");
              hls.recoverMediaError();
              break;

            default:
              console.error("HLS fatal error → destroy", data);
              clearTimeout(manifestTimeout);
              hls.destroy();
              break;
          }
        });
      });
    } catch (e) {
      console.error("initImgAndVideo error:", e);
    } finally {
      loading.value = false;
    }
  };
  onBeforeUnmount(() => {
    contentRef.value = null;
    hlsInstances.value.forEach((hls) => {
      hls.destroy();
    });
  });
  defineExpose({
    init: (content: string) => {
      initImgAndVideo(content);
    },
  });
</script>

<template>
  <div
    class="mt-5 text-body-1 article-content"
    style="max-width: 100%"
  >
    <!-- Raw/original content while decrypting -->
    <!-- {{ placeholderContent }} -->
    <div
      v-show="loading"
      v-html="loadingContent"
    />
    <!-- Final decrypted content -->
    <div
      v-show="!loading"
      ref="contentRef"
    />
  </div>
</template>

<style scoped lang="scss">
  .article-content {
    max-width: 100% !important;
    width: 100%;
    display: block;

    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin-inline: auto;
    }
  }
</style>
