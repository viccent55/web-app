<template>
  <v-dialog v-model="showDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">新版本可用</v-card-title>
      <v-card-text>此应用有新版本可用。请重新加载以获取最新更新。</v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text color="grey" @click="showDialog = false">
          取消
        </v-btn>
        <v-btn color="primary" @click="reloadApp" prepend-icon="mdi-refresh">
          立即重新加载
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useStore } from "@/stores/index";

const showDialog = ref(false);
const store = useStore();

const openNoteDialog = () => {
  showDialog.value = true;
};

const reloadApp = () => {
  store.localVersion = store.configuration?.version || 0;
  window.location.reload();
};
defineExpose({
  openNoteDialog,
});
</script>
