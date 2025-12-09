<script lang="ts" setup>
import { ref, computed, onMounted, type PropType } from "vue";
import { Local } from "@/utils/storage";

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

const SESSION_KEY_PREFIX = "ads_";
const SESSION_DURATION = 1 * 60 * 60 * 1000; // 1 hour

function getSessionKey(advert: Advert): string {
  if (!advert || !advert.id) {
    console.error("Advertisement is missing an ID.", advert);
    return `${SESSION_KEY_PREFIX}unknown`;
  }
  return `${SESSION_KEY_PREFIX}${advert.id}`;
}

// ✅ check if this ad was shown within SESSION_DURATION using Local storage
function isSessionActive(advert: Advert): boolean {
  const key = getSessionKey(advert);

  try {
    const stored = Local.get(key); // might throw if missing / invalid
    if (stored == null) return false;

    const last =
      typeof stored === "number" ? stored : Number(stored);

    if (!Number.isFinite(last)) return false;

    return Date.now() - last < SESSION_DURATION;
  } catch (e) {
    console.error("Failed to read Local storage item:", e);
    return false;
  }
}

// ✅ store the timestamp when this ad was just shown/closed
function setSession(advert: Advert) {
  const key = getSessionKey(advert);

  try {
    Local.set(key, Date.now()); // store as number
  } catch (e) {
    console.error("Failed to set Local storage item:", e);
  }
}

function closeDialog() {
  dialog.value = false;
}

function onAfterLeave() {
  if (!currentAdvert.value) return;

  // Set session for the ad that was just closed
  setSession(currentAdvert.value);

  // Move to the next ad in the queue
  currentAdIndexInQueue.value++;

  if (currentAdIndexInQueue.value < adQueue.value.length) {
    // Use a small delay to make the transition smoother
    setTimeout(() => {
      dialog.value = true;
    }, 300);
  }
}

onMounted(() => {
  if (!props.adverts || !props.adverts.length) return;

  // Filter ads to create a queue of those that should be shown
  adQueue.value = props.adverts.filter((advert) => {
    if (!advert.id) {
      console.warn("Skipping an advert because it has no ID.", advert);
      return false;
    }
    return !isSessionActive(advert);
  });

  if (adQueue.value.length > 0) {
    dialog.value = true;
  }
});
</script>

<template>
  <v-dialog v-model="dialog" @after-leave="onAfterLeave" content-class="overflow-visible bg-transparent elevation-0"
    persistent>
    <div style="position: relative">
      <v-card class="pa-0" color="transparent" flat>
        <DesktopAdvertSlot v-if="currentAdvert" :advert="currentAdvert" class="height-dialog" />
      </v-card>

      <v-btn icon variant="flat" color="surface" class="close-button" @click="closeDialog" density="comfortable">
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
