<script setup lang="ts">
  definePageMeta({
    keepalive: true,
  });
  const handleClick = () => {
    window.open("https://t.me/HFDHG9985", "_blank");
  };
  const { isNative } = usePlatform();
  const heightOffset = computed(() => {
    return isNative.value ? "200px" : "90px";
  });
</script>

<template>
  <v-container
    fluid
    class="creator-page-wrapper"
  >
    <div class="creator-background" />
    <v-row
      justify="center"
      align="center"
      class="creator-content-row"
    >
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          elevation="0"
          class="creator-card"
          @click="handleClick"
        >
          <!-- Creator Image -->
          <v-img
            src="/creator.jpg"
            lazy-src="/creator.jpg"
            contain
            class="rounded-lg"
          >
            <!-- Placeholder slot -->
            <template #placeholder>
              <div class="image-slot">Loading...</div>
            </template>
          </v-img>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
  .creator-page-wrapper {
    position: relative;
  }

  .creator-background {
    position: absolute;

    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("/creator.jpg");
    background-size: cover;
    background-position: center center;
    filter: blur(2px) brightness(0.7);
    z-index: 0;
  }

  .creator-content-row {
    height: calc(100vh - v-bind(heightOffset));
  }

  .creator-card {
    border: none;
    cursor: pointer;
    transition: transform 0.2s ease;
    background-color: transparent;
  }

  .creator-card:hover {
    transform: translateY(-4px);
  }
</style>
