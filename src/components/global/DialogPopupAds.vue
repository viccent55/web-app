<script lang="ts" setup>
  import { ref, computed, onMounted, type PropType } from "vue";

  interface Advert {
    id: number | string;
    image: string;
    url: string;
    title?: string;
  }

  const props = defineProps({
    adverts: {
      type: Array as PropType<Advert[]>,
      default: () => [],
    },
  });

  const dialog = ref(false);
  const adQueue = ref<Advert[]>([]);
  const currentAdIndexInQueue = ref(0);

  const currentAdvert = computed(
    () => adQueue.value[currentAdIndexInQueue.value]
  );

  function closeDialog() {
    dialog.value = false;
  }

  function onAfterLeave() {
    currentAdIndexInQueue.value++;

    if (currentAdIndexInQueue.value < adQueue.value.length) {
      setTimeout(() => {
        dialog.value = true;
      }, 300);
    }
  }

  // ✅ ONCE PER TAB SESSION (survives reload, cleared when tab closes)
  const SESSION_ONCE_KEY = "ads_popup_shown_this_session_v1";

  function hasShownThisSession(): boolean {
    if (typeof window === "undefined") return true; // SSR: don't show
    try {
      return window.sessionStorage.getItem(SESSION_ONCE_KEY) === "1";
    } catch {
      return true;
    }
  }

  function markShownThisSession() {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(SESSION_ONCE_KEY, "1");
    } catch {}
  }
  const safeAdverts = computed<Advert[]>(() => {
    return Array.isArray(props.adverts) ? props.adverts : [];
  });
  onMounted(() => {
    // ✅ already shown in this session -> never show again on reload/href
    if (hasShownThisSession()) return;

    if (!safeAdverts.value.length) return;

    // build queue (SAFE)
    adQueue.value = safeAdverts.value.filter((a) => !!a?.id);

    if (adQueue.value.length > 0) {
      // ✅ mark immediately so reload won’t show again
      markShownThisSession();
      dialog.value = true;
    }
  });
</script>

<template>
  <v-dialog
    v-model="dialog"
    @after-leave="onAfterLeave"
    content-class="overflow-visible bg-transparent elevation-0"
    persistent
  >
    <div style="position: relative">
      <v-card
        class="pa-0"
        color="transparent"
        flat
      >
        <AdvertSlot
          v-if="currentAdvert"
          :advert="currentAdvert"
          class="height-dialog"
        />
      </v-card>

      <v-btn
        icon
        variant="flat"
        color="surface"
        class="close-button"
        @click="closeDialog"
        density="comfortable"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
  </v-dialog>
</template>

<style scoped lang="scss">
  .close-button {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -150%);
    z-index: 20;
  }

  .height-dialog {
    display: block;
    margin-inline: auto;
    width: 100%;
    max-width: 530px;
    aspect-ratio: 530 / 590;
    object-fit: contain;
    max-height: 85vh;
  }
</style>
