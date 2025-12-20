<!-- components/ChatWidget.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { useCustomerService, type ChatUser } from "@/composables/useCustomerService";

const props = withDefaults(
  defineProps<{
    user: ChatUser;
  }>(),
  {
    user: () => ({}),
  }
);

const { buildChatUrl } = useCustomerService();

const visible = ref(false);
const url = ref<string | null>(null);

const open = () => {
  if (typeof window === "undefined") return;
  url.value = buildChatUrl(props.user);
  if (!url.value) return;
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

defineExpose({ open, close });
</script>

<template>
  <!-- You can design this however you like -->
  <Teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="chat-overlay">
        <div class="chat-panel">
          <v-toolbar density="compact" class="px-4" color="primary">
            <span>在线客服</span>
            <v-spacer></v-spacer>
            <button class="chat-close" @click="close">
              ×
            </button>
          </v-toolbar>
          <div class="chat-body">
            <iframe v-if="url" :src="url" class="chat-iframe" frameborder="0"
              allow="clipboard-read; clipboard-write; microphone; camera" />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.chat-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  z-index: 9999;

  /* ✅ keep overlay content above iPhone home indicator */
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-right: env(safe-area-inset-right, 0px);
  padding-left: env(safe-area-inset-left, 0px);
}

.chat-panel {
  width: 360px;
  max-width: 100%;

  /* ✅ allow safe bottom space inside panel */
  height: min(540px, calc(100vh - 24px - env(safe-area-inset-top, 0px)));
  max-height: calc(90vh - env(safe-area-inset-bottom, 0px));

  background: #111827;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* margin now safe because overlay has padding */
  margin: 0 12px 12px;
}

.chat-body {
  flex: 1;
  background: #000;
  /* ✅ reserve space so iframe bottom UI isn't behind home indicator */
  padding-bottom: env(safe-area-inset-bottom, 0px);
  /* important so iframe doesn't overflow outside */
  overflow: hidden;
}

.chat-iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

/* simple fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
