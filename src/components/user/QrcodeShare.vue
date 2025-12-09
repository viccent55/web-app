<script setup lang="ts">
import Qrcode from "qrcode";
import { getCurrentDomain } from "@/service";
import useVariable from "@/composables/useVariable";
import useSnackbar from "@/composables/useSnackbar";

const { route, onCopy, storeUser } = useVariable();
const snackbar = useSnackbar();

const state = reactive({
  isOpen: false,
  item: {
    title: "",
    content: "",
    color: "",
  },
  qrcodeUrl: "",
});
// --- QR Code logic ---
const generateQrcode = async () => {
  const id = storeUser.userInfo?.id || route.params?.id;
  if (id) {
    const url = `${getCurrentDomain()}/?invite_code=${storeUser.userInfo.invite_code}`;
    try {
      state.qrcodeUrl = await Qrcode.toDataURL(url, { width: 300 });
    } catch (err) {
      console.error("Failed to generate QR code:", err);
    }
  }
};
const apps = [
  { name: "微信", icon: "/users/wechat.png" },
  { name: "QQ", icon: "/users/qq.png" },
  { name: "陌陌", icon: "/users/momo.png" },
  { name: "探探", icon: "/users/tantan.png" },
];

const copyLink = () => {
  onCopy(
    `${getCurrentDomain()}/?invite_code=${storeUser.userInfo.invite_code}`
  );
  snackbar.showSnackbar("邀请码已复制！", "success", "center");
};

const saveImg = () => {
  if (!state.qrcodeUrl) {
    snackbar.showSnackbar("QR code not available", "error");
    return;
  }
  const link = document.createElement("a");
  link.href = state.qrcodeUrl;
  link.download = `qrcode-invite-${storeUser.userInfo?.invite_code}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const onSocialShare = (app: { name: string }) => {
  const shareUrl = `${getCurrentDomain()}/?invite_code=${storeUser.userInfo.invite_code}`;
  const title = "我的推广码";
  const summary = `邀请码: ${storeUser.userInfo?.invite_code}。邀请好友，解锁更多福利！`;
  let platformUrl = "";

  switch (app.name) {
    case "QQ":
      platformUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(
        shareUrl
      )}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(
        summary
      )}`;
      window.open(platformUrl, "_blank");
      break;
    default:
      // For other platforms like WeChat, Momo, Tantan, direct web sharing is limited.
      // A common approach is to copy the link and instruct the user to paste it.
      copyLink();
      snackbar.showSnackbar(
        `链接已复制，请打开 ${app.name} 分享`,
        "info",
        "center"
      );
      break;
  }
};
onMounted(() => {
  generateQrcode();
});
defineExpose({
  open: () => {
    state.isOpen = true;
  },
});
</script>

<template>
  <!-- QR Code Dialog -->
  <v-dialog v-model="state.isOpen" scrollable max-width="550">
    <v-card class="rounded-xl">
      <v-card-title>
        <v-btn icon="mdi-chevron-left" flat density="compact" @click="state.isOpen = false"
          style="position: absolute; top: 10px; left: 10px">
          <v-icon size="24px"></v-icon>
        </v-btn>
        <!-- Title -->
        <div class="text-center mb-2">我的推广码</div>

        <!-- Invite Code -->
        <div class="text-center text-green text-h5 font-weight-bold">
          {{ storeUser?.userInfo?.invite_code }}
        </div>
      </v-card-title>

      <v-card-text class="pt-0">
        <!-- QR + Copy Button overlay -->
        <div class="d-flex flex-column align-center">
          <div class="position-relative">
            <v-img :src="state.qrcodeUrl" width="150" height="150" class="mx-auto" />
          </div>
        </div>

        <!-- Invite Count -->
        <div class="text-center my-4">
          累计邀请
          <span class="text-green font-weight-bold">5</span>
          人
        </div>

        <!-- Action Buttons -->
        <v-row>
          <v-col cols="6">
            <v-btn block rounded color="primary" @click="saveImg">
              保存图片
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn block rounded color="primary" @click="copyLink">
              复制推广链接
            </v-btn>
          </v-col>
        </v-row>

        <!-- Rules -->
        <div class="text-body-2 my-4">
          <p>规则说明：</p>
          <p>1. 邀请5名真实好友成功注册，即可解锁禁区视频免费观看。</p>
          <p>2. 点击【保存二维码】或【复制推广链接】获得专属推广链接。</p>
          <p>3. 禁止使用非法程序作弊，一经发现，账号将永久封禁。</p>
        </div>

        <!-- Steps -->
        <div class="text-body-2 mb-3">
          <p>邀请步骤</p>

          <p><b class="text-green">① 步骤1</b></p>
          <p>点击【保存图片】或【截图分享】</p>

          <p><b class="text-green">② 步骤2</b></p>
          <p>发送图片或链接给好友</p>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="d-flex ga-5 justify-center w-100">
          <div v-for="app in apps" :key="app.name" class="text-center" @click="onSocialShare(app)">
            <v-img :src="app.icon" width="40"></v-img>
            <div class="text-caption mt-1">
              {{ app.name }}
            </div>
          </div>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
