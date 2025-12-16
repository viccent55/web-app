<script setup lang="ts">
import { useTheme } from "vuetify";
import type { VSnackbar } from "vuetify/components/VSnackbar";
import { openLoginDialog } from "@/hooks/useLoginDialog";
import NotificationDialog from "@/components/global/NotificationDialog.vue";
import NoteDialog from "@/components/explore/NoteDialog.vue";
import UpdateVersion from "@/components/UpdateVersion.vue";
import { listenResizeEvent } from "@/hooks/useScreenMode";
import { generateCode } from "@/utils/toolsValidate";
import ArticleNoteDialog from "@/components/article/NoteDialog.vue";
import ForbiddenNoteDialog from "@/components/forbidden/NoteDialog.vue";
import HookupNoteDialog from "@/components/hookup/NoteDialog.vue";
import AnalyticsLoader from "@/components/global/AnalyticsLoader.vue";
import DialogPopupAds from "@/components/global/DialogPopupAds.vue";

import {
  initPermissions,
  setDefaultPermission,
  setDefaultRejectCallback,
} from "@/hooks/usePermisions";
import { PERMISSION } from "@/common/permision";
import { useNoteDialog } from "@/hooks/useNoteDialog";
import { useNoteArticleDialog } from "@/hooks/useNoteArticleDialog";
import { useNoteForbidden } from "@/hooks/useNoteForbiddenDialog";
import { useNoteHookupDialog } from "@/hooks/useNoteHookupDialog";
import useHome from "@/composables/useHome";
import useVariable from "@/composables/useVariable";
import useConfiguration from "@/composables/useConfiguration";
import { useReport } from "@/composables/useReport";
import DailogBase64Ads from "@/components/global/DailogBase64Ads.vue";
import { getInstallCode } from "@/service/index"

const { storeUser, store } = useVariable();
const { initAds } = useHome();
const { runOncePerDay, onReportIos } = useReport()
const theme = useTheme();
const { getConfig } = useConfiguration();
const noteDialog = useNoteDialog();
const noteArticleDetail = useNoteArticleDialog();
const noteForbiddenDialog = useNoteForbidden();
const noteHookupDialog = useNoteHookupDialog();
const permissions = [PERMISSION.Visitor, PERMISSION.User];
const chatWidgetRef = useTemplateRef("chat-wiget");

initPermissions(permissions);
setDefaultPermission(
  storeUser.isLogin ? PERMISSION.User : PERMISSION.Visitor
);

setDefaultRejectCallback(openLoginDialog);

type SnackbarLocation = VSnackbar["$props"]["location"];

const state = reactive({
  message: "",
  color: "primary",
  timeout: 3000,
  show: false,
  location: "bottom center" as SnackbarLocation,
});

const handle = {
  triggerSnackbar(
    msg: string,
    color: string = "success",
    location: SnackbarLocation = "bottom center",
    time: number = 3000
  ) {
    state.message = msg;
    state.color = color;
    state.timeout = time;
    state.show = true;
    state.location = location;
  },
  openChat() {
    console.log("用户点击了联系客服反馈问题领取奖励");
    chatWidgetRef.value?.open();
  }
};

// ✅ Provide as a single object
provide("uiActions", handle);


const reloadPage = () => {
  window.location.reload();
};
const notificationDialogRef = ref<InstanceType<typeof NotificationDialog>>();
const initializeApp = async () => {
  const NOTIFICATION_COOLDOWN = 60 * 60 * 1000; // 1 hour
  try {
    await getConfig();
    const LOGIN_DIALOG_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours
    // If initMode is successful, check for login
    if (!storeUser.isLogin) {
      const lastLoginPrompt = localStorage.getItem(
        "lastLoginPromptTimestamp"
      );
      const now = Date.now();
      if (
        !lastLoginPrompt ||
        now - Number(lastLoginPrompt) > LOGIN_DIALOG_COOLDOWN
      ) {
        openLoginDialog();
        localStorage.setItem("lastLoginPromptTimestamp", String(now));
      }
    }
  } catch (error) {
    console.error("Server is down or initial fetch failed:", error);
    const now = Date.now();
    const lastShown = localStorage.getItem("lastNotificationTimestamp");
    if (!lastShown || now - Number(lastShown) > NOTIFICATION_COOLDOWN) {
      notificationDialogRef.value?.open();
      localStorage.setItem("lastNotificationTimestamp", String(now));
    }

  }
};
const updateVersionRef = ref();
onBeforeMount(async () => {
  if (!storeUser.visitCode) {
    storeUser.visitCode = generateCode()
  }
  listenResizeEvent();
  if (store.localVersion != store.configuration?.version) {
    updateVersionRef.value?.openNoteDialog();
  }
});
const showButton = ref(false);
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
const checkScroll = () => {
  showButton.value = window.scrollY > 300;
};

onBeforeUnmount(() => {
  window.removeEventListener("scroll", checkScroll);
});
const ADS_ONCE_KEY = "ios_ads_shown_once_v1";
function shouldShowAdsOnce(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADS_ONCE_KEY) !== "1";
}
const showAds = ref(getInstallCode() ? shouldShowAdsOnce() : false);
onMounted(() => {
  window.addEventListener("scroll", checkScroll);
  theme.change(store.darkMode);
  setTimeout(() => {
    noteDialog.queryNoteDialogId();
    noteArticleDetail.queryNoteDialogId();
    noteForbiddenDialog.queryNoteDialogId();
    noteHookupDialog.queryNoteDialogId();
  }, 500);
  initAds();
  initializeApp();
  runOncePerDay()
  onReportIos();

});
</script>

<template>
  <v-snackbar v-model="state.show" :color="state.color" :timeout="state.timeout" :location="state.location">
    {{ state.message }}
    <template #actions>
      <v-btn color="white" density="compact" variant="elevated" elevation="0" @click="state.show = false">
        关闭
      </v-btn>
    </template>
  </v-snackbar>
  <v-app>
    <router-view />
    <LoginDialog></LoginDialog>
    <NotificationDialog ref="notificationDialogRef" @retry="reloadPage" />
    <UpdateVersion ref="updateVersionRef" />
    <NoteDialog />
    <ArticleNoteDialog />
    <ForbiddenNoteDialog />
    <HookupNoteDialog />
    <ChatWidget ref="chat-wiget" :user="storeUser.userInfo" />
    <DialogPopupAds v-if="!storeUser.loginDialogVisible && store.homePopupAds?.length" :adverts="store.homePopupAds" />
    <DailogBase64Ads v-if="getInstallCode()" v-model="showAds" :duration="5" auto-close />
    <AnalyticsLoader :analytics="store.configuration?.analytics" />
    <!-- Floating FAB -->
    <div>
      <v-fab class="fab" icon="mdi-refresh" size="small" @click="reloadPage()" />
      <v-fab v-if="showButton" class="scroll-to-top" size="small" icon="mdi-arrow-up" @click="scrollToTop" />
    </div>

  </v-app>
</template>
<style scoped>
.fab,
.scroll-to-top {
  position: fixed;
  right: 10px;
  z-index: 99;
}

.fab {
  bottom: 80px;
}

.scroll-to-top {
  bottom: 130px;
}

/* Desktop overrides */
@media (min-width: 960px) {
  .fab {
    bottom: 30px;
    right: 30px;
  }

  .scroll-to-top {
    bottom: 80px;
    right: 30px;
  }
}
</style>
