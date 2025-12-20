<script lang="ts" setup>
import { reactive, ref } from "vue";
import { screenMode } from "@/hooks/useScreenMode";
import { getPageInfo } from "@/service/getMethod";

const dialogVisible = ref(false);
const loading = ref(false);

const state = reactive({
  name: "",
  title: "",
  content: "",
});

async function open(item: Record<string, string>) {
  dialogVisible.value = true;
  loading.value = true;

  // Reset previous state
  state.name = "Loading...";
  state.content = "";

  try {
    const page = item?.page as string;
    const response = await getPageInfo(page);
    state.name = response.data.name;
    state.title = response.data.title;
    state.content = response.data.content;
  } catch (error) {
    console.error("Failed to fetch dialog data:", error);
    state.name = "Error";
    state.content = "Failed to load content. Please try again later.";
  } finally {
    loading.value = false;
  }
}

const handleClose = () => {
  dialogVisible.value = false;
};

defineExpose({
  open,
});
</script>

<template>
  <v-dialog v-model="dialogVisible" :max-width="screenMode === 'phone' ? '90%' : '700px'" scrollable>
    <v-card :loading="loading">
      <!-- Header -->
      <v-card-title class="d-flex justify-end">
        <v-btn icon="mdi-close" variant="text" @click="handleClose" />
      </v-card-title>

      <!-- Body -->
      <v-card-text class="pt-0">
        <h2 class="text-h5 text-center font-weight-bold mb-2 mt-0 text-primary">
          {{ state.name }}
        </h2>
        <div class="text-center mb-2">
          {{ state.title }}
        </div>
        <p class="mt-2" v-html="state.content"></p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
