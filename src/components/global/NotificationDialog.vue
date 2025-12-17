<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useStore } from "@/stores";
import useHome from "@/composables/useHome";

const emit = defineEmits(["retry", "finished"]);

const dialogVisible = ref(false);
const currentIndex = ref(0);

const store = useStore();
const { popupNotice } = storeToRefs(store);
const { getPopupnotice } = useHome();

/* --------------------------------
 * Show once per session (exit app/tab then re-enter)
 * -------------------------------- */
const SESSION_KEY = "popup_notice_shown_this_session";

function canShowThisSession() {
  return sessionStorage.getItem(SESSION_KEY) !== "1";
}

function markShownThisSession() {
  sessionStorage.setItem(SESSION_KEY, "1");
}

/* --------------------------------
 * Current notice
 * -------------------------------- */
const currentNotice = computed(() => {
  return popupNotice.value?.[currentIndex.value] || null;
});

/* --------------------------------
 * Open dialog if allowed
 * -------------------------------- */
const open = () => {
  if (!popupNotice.value?.length) return;
  if (!canShowThisSession()) return;

  currentIndex.value = 0;
  dialogVisible.value = true;

  // ✅ mark as shown for this session
  markShownThisSession();
};

/* --------------------------------
 * Close → show next
 * -------------------------------- */
const closeAndNext = () => {
  dialogVisible.value = false;

  setTimeout(() => {
    currentIndex.value++;

    if (currentIndex.value < popupNotice.value.length) {
      dialogVisible.value = true;
    } else {
      emit("finished");
    }
  }, 300);
};

const closeOnly = () => closeAndNext();

/* --------------------------------
 * Auto open when data arrives
 * -------------------------------- */
watch(
  () => popupNotice.value,
  (list) => {
    if (list?.length) open();
  },
  { immediate: true }
);

onMounted(() => {
  getPopupnotice();
});

defineExpose({ open });
</script>

<template>
  <v-dialog v-model="dialogVisible" max-width="450" persistent v-if="currentNotice">
    <v-card class="position-relative">
      <!-- Close icon top-right -->
      <v-btn
        icon
        variant="text"
        class="position-absolute"
        style="top: 6px; right: 6px; z-index: 2"
        @click="closeOnly"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <v-card-title class="text-center font-weight-bold text-warning">
        {{ currentNotice.title }}
      </v-card-title>

      <v-card-text class="text-center">
        <div v-html="currentNotice.content" />
      </v-card-text>

      <v-card-actions class="justify-center">
        <div class="pa-2 w-100">
          <v-btn variant="flat" block color="primary" rounded="pill" @click="closeAndNext">
            知道了
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
