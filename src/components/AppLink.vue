<script setup lang="ts">
  import AdvertSlot from "./AdvertSlot.vue";

  // props for dynamic apps
  defineProps<{
    apps: {
      name: string;
      image: string;
      url: string;
    }[];
    height: string;
  }>();

  defineEmits<{
    (e: "item-click", app: { name: string; image: string; url: string }): void;
  }>();
</script>

<template>
  <v-card
    class="rounded-xl"
    flat
    :style="{ maxHeight: height, overflow: 'auto' }"
  >
    <v-card-text>
      <v-row dense>
        <v-col
          v-for="(app, index) in apps"
          :key="index"
          cols="4"
          class="d-flex flex-column align-center justify-center"
        >
          <a
            :href="app.url"
            target="_blank"
            rel="noopener noreferrer"
            class="d-flex flex-column align-center text-surface-variant text-decoration-none"
            @click="$emit('item-click', app)"
          >
            <AdvertSlot
              :advert="{ title: app.name, image: app.image, url: app?.url }"
              fit="cover"
              style="width: 32px; height: 32px"
            />
            <span class="text-caption mt-1">{{ app.name }}</span>
          </a>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
  .text-caption {
    font-size: 12px;
    text-align: center;
  }
</style>
