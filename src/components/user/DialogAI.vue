<script setup lang="ts">
  const state = reactive({
    isOpen: false,
    item: {
      title: "",
      content: "",
      color: "",
    },
  });

  const emit = defineEmits(["close"])
  const onCallSupport = () => {
    state.isOpen = false
    emit('close');
  }

  defineExpose({
    open: (item: { title: string; content: string; color: string }) => {
      state.item = item;
      state.isOpen = true;
    },
  });
</script>

<template>
  <v-dialog
    v-model="state.isOpen"
    max-width="550px"
  >
    <v-card>
      <v-card-title class="text-h6 text-center mt-2">
        {{ state.item.title }}
      </v-card-title>
      <v-card-text>
        <div :class="`text-body-1 text-${state.item.color} text-center`">
          {{ state.item.content }}
        </div>
        <v-btn
          class="mt-5"
          block
          color="primary"
          rounded="xl"
          @click="onCallSupport()"
        >
          联系在线客服
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
