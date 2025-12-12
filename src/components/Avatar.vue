<script lang="ts" setup>
import { ref, watchEffect, reactive, nextTick } from "vue";
import { useDecryption } from "@/composables/useDecryption";

const props = defineProps({
  src: {
    type: String,
    default: () => "",
  },
  size: {
    type: [String, Number],
    default: "32", // Vuetify `v-avatar` expects number or px
  },
  id: {
    type: [Number, String],
    default: () => "",
  },
});

const emit = defineEmits(["imageDimensions"]);
const { decryptImage, decryptedImage } = useDecryption();

watchEffect(() => {
  if (props.src) {
    decryptImage(props.src);
  }
});

const imageRef = ref<HTMLImageElement | null>(null);

const state = reactive({
  width: 0,
  height: 0,
  isVertical: false,
});

const handleImageLoad = () => {
  nextTick(() => {
    const img = imageRef.value;
    if (img) {
      state.width = img.naturalWidth;
      state.height = img.naturalHeight;
      state.isVertical = state.height > state.width;
      emit("imageDimensions", state);
    } else {
      console.error("Could not find image element in the DOM.");
    }
  });
};

</script>

<template>
  <v-avatar :size="size">
    <v-img v-if="decryptedImage" :src="decryptedImage" cover ref="imageRef" @load="handleImageLoad" />
    <v-img v-else src="/logo.webp" cover ref="imageRef" @load="handleImageLoad" />
  </v-avatar>
</template>
