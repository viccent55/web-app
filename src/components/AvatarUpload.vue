<script setup lang="ts">
  import { ref } from "vue";

  // Props & emits
  const props = defineProps<{
    size?: number;
    modelValue?: string; // for v-model binding (Base64 string)
  }>();

  const emit = defineEmits<{
    (e: "update:modelValue", value: string): void;
  }>();

  const avatarSrc = ref(props.modelValue);

  // open file input
  function onSelectFile() {
    inputRef.value?.click();
  }

  // hidden file input ref
  const inputRef = ref<HTMLInputElement | null>(null);

  // compress file and convert to base64
  async function handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const compressed = await compressImage(file, 0.7); // 70% quality
    avatarSrc.value = compressed;
    emit("update:modelValue", compressed);
    isBase64.value = true;
    // reset input to allow re-selection of same file
    (e.target as HTMLInputElement).value = "";
  }

  const isBase64 = ref(false);
  // compress image to base64
  function compressImage(file: File, quality = 0.8): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          const MAX_WIDTH = 400; // adjust max width

          let { width, height } = img;
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL("image/jpeg", quality);
          resolve(base64);
        };
      };
    });
  }
</script>

<template>
  <div>
    <v-avatar
      v-if="avatarSrc"
      :size="80"
      :src="avatarSrc"
      style="cursor: pointer"
      @click="onSelectFile"
    >
      <Image
        :src="avatarSrc"
        v-if="!isBase64"
      />
      <v-img
        lazy
        v-else
        :src="avatarSrc"
      ></v-img>
    </v-avatar>
    <v-avatar
      :size="80"
      v-else
      style="cursor: pointer"
      @click="onSelectFile"
    >
      <img
        src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
      />
    </v-avatar>

    <!-- Hidden file input -->
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>
