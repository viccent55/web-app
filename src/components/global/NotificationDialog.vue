<script setup lang="ts">
  import { ref } from "vue";

  const emit = defineEmits(["retry"]);

  const dialogVisible = ref(false);

  const open = () => {
    dialogVisible.value = true;
  };

  const onRetry = () => {
    emit("retry");
    dialogVisible.value = false;
    // Close logic handled by parent
  };

  defineExpose({
    open,
  });
</script>

<template>
  <v-dialog
    v-model="dialogVisible"
    max-width="350"
    persistent
  >
    <v-card>
      <v-card-text class="mt-5 text-center">
        小红书正在维护，可能无法获取信息。请稍后重试
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn
          color="primary"
          rounded="pill"
          @click="onRetry"
        >
          重试
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
