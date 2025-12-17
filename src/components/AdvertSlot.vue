<script setup lang="ts">
defineProps({
  advert: {
    type: Object,
    required: true,
  },
  aspectRatio: {
    type: Number || String,
    default: "",
  },
  height: {
    type: String,
    default: () => "100%",
  },
});
</script>

<template>
  <v-card flat elevation="0" color="transparent">
    <a class="cursor-pointer text-decoration-none " :href="advert?.url || '#'" target="_blank"
      rel="nofollow noopener noreferrer">
      <Image :src="advert?.image" :alt="advert?.title" contain :height="height" :aspectRatio="aspectRatio" />
    </a>
  </v-card>
</template>
