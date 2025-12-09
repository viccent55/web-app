<script lang="ts" setup>
import { useDecryption } from '@/composables/useDecryption';
import Hls from 'hls.js';
const props = defineProps({
  content: {
    type: String,
    default: () => "",
  },
  skeleton: {
    type: Number,
    default: 4,
  },
});
const clonedContent = computed(() => structuredClone(props.content));
// your composable

const { decryptImage, decryptedImage } = useDecryption();

const contentRef = ref<HTMLDivElement | any>(null);
const loading = ref(false);
const hlsInstances = ref<any[]>([]);

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
          await decryptImage(lazySrc); // use returned value per image
          if (decryptedImage.value) {
            img.removeAttribute("data-lazy-src");
            img.src = decryptedImage.value;
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
    if (videos && videos.length > 0) {
      videos.forEach((video: HTMLVideoElement) => {
        video.style.display = "block";
        video.style.width = "100%";
        video.style.maxHeight = "400px"; // 🔹 your desired limit
        video.style.objectFit = "contain"; // keeps aspect ratio
        video.setAttribute("controls", "true");
        video.setAttribute("playsinline", "true");
        const src = video.getAttribute("src");
        if (!src) return;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src; // Safari native
        } else if (Hls.isSupported() && video) {
          const hls = new Hls();
          hlsInstances.value.push(hls);
          hls.loadSource(src);
          hls.attachMedia(video);
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
        }
      });
    }
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
  <div class="mt-5 text-body-1 article-content" style="max-width: 100%">
    <!-- Raw/original content while decrypting -->
    <!-- {{ placeholderContent }} -->
    <div v-show="loading" v-html="clonedContent" />

    <!-- Final decrypted content -->
    <div v-show="!loading" ref="contentRef" />
    <!-- Fallback if JS is disabled -->
    <noscript>
      <div v-html="clonedContent"></div>
    </noscript>
    <!-- end js disabled -->
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
