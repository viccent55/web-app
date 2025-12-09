<script setup lang="ts">
  import { ref } from "vue";

  const model = ref(false);
  const query = ref("");

  // mock data
  const history = ref(["Technology", "AI News", "Travel Tips"]);
  const hotKeywords = ref([
    { title: "Top 10 AI Tools", views: "7.8k" },
    { title: "Best Travel Spots 2025", views: "5.2k" },
    { title: "Healthy Recipes", views: "4.9k" },
    { title: "Vue 3 Tips & Tricks", views: "3.1k" },
    { title: "Mobile Photography", views: "2.8k" },
    { title: "Remote Work Lifestyle", views: "2.5k" },
    { title: "Learning FilamentPHP", views: "2.1k" },
  ]);

  const selectKeyword = (keyword: string) => {
    query.value = keyword;
    model.value = false;
    // you can trigger a search here
  };

  const shuffleHotKeywords = () => {
    hotKeywords.value = [...hotKeywords.value].sort(() => Math.random() - 0.5);
  };
</script>

<template>
  <v-dialog
    v-model="model"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card
      color="background"
      class="pa-0"
    >
      <v-card-title>
        <mobile-search />
      </v-card-title>

      <!-- History section -->
      <div
        v-if="history.length"
        class="mt-6"
      >
        <div class="text-subtitle-1 font-weight-medium mb-2">
          Search History
        </div>
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="(item, index) in history"
            :key="'history-' + index"
            color="secondary"
            variant="tonal"
            size="small"
            @click="selectKeyword(item)"
          >
            {{ item }}
          </v-chip>
        </div>
      </div>

      <!-- Hot keywords -->
      <div class="mt-8">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="text-subtitle-1 font-weight-medium">Trending Now</div>
          <v-btn
            variant="text"
            size="small"
            @click="shuffleHotKeywords"
          >
            Refresh
          </v-btn>
        </div>

        <v-list
          density="compact"
          class="rounded-lg border"
        >
          <v-list-item
            v-for="(item, index) in hotKeywords"
            :key="'hot-' + index"
            @click="selectKeyword(item.title)"
            class="cursor-pointer"
          >
            <template #prepend>
              <v-avatar
                size="22"
                :color="
                  index === 0
                    ? 'red'
                    : index === 1
                      ? 'orange'
                      : index === 2
                        ? 'yellow'
                        : 'grey'
                "
                class="text-white text-caption"
              >
                {{ index + 1 }}
              </v-avatar>
            </template>

            <v-list-item-title>{{ item.title }}</v-list-item-title>
            <v-list-item-subtitle class="text-grey text-caption">
              {{ item.views }} views
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>

      <!-- Bottom close button -->
      <div class="mt-8 text-center">
        <v-btn
          variant="flat"
          color="primary"
          class="px-6 rounded-pill"
          @click="model = false"
        >
          Close
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss"></style>
