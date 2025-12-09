<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import AvatarUpload from "@/components/AvatarUpload.vue";
import { setUserInfo, changePassword } from "@/service/user";
import { screenMode } from "@/hooks/useScreenMode";
import useSnackbar from "@/composables/useSnackbar";

const props = defineProps({
  user: { type: Object, default: () => ({}) },
  self: { type: Boolean, default: false },
});

const emit = defineEmits(["refresh"]);
const dialogVisible = ref(false);
const activeTab = ref("userinfo");
const snackbar = useSnackbar();

// --- user info form ---
const userInfo = reactive({
  avatar: "",
  nickname: "",
  slogan: "",
});

watch(dialogVisible, (v) => {
  if (v) {
    userInfo.nickname = props.user.nickname;
    userInfo.avatar = props.user.avatar || "/avatar/user/header.png";
    userInfo.slogan = props.user.slogan;
  }
});

// --- reset password form ---
const resetForm = reactive({
  password_old: "",
  password: "",
  password_repeat: "",
});

// --- actions ---
const updateUserInfo = async () => {
  try {
    if (userInfo.nickname && userInfo.nickname.length > 10) {
      snackbar.showSnackbar("昵称不能为空", "warning", "top");
      return;
    }

    // Only include the avatar if it's a new Base64 encoded image.
    const avatarPayload = userInfo.avatar.startsWith("data:image/")
      ? userInfo.avatar
      : "";
    const request = {
      nickname: userInfo.nickname,
      avatar: avatarPayload,
      slogan: userInfo.slogan,
    };
    const response = await setUserInfo(request);

    if (response.errcode === 0) {
      snackbar.showSnackbar("✅ 用户信息已更新！", "success", "top");
    } else {
      snackbar.showSnackbar(response.info, "error", "top");
    }
    dialogVisible.value = false;
    emit("refresh");
  } catch (e) {
    console.error(e);
  }
};

const onChangePassword = async () => {
  try {
    const response = await changePassword(resetForm);
    if (response.errcode === 0) {
      snackbar.showSnackbar("✅ 密码重置成功！", "success", "top");
    } else {
      snackbar.showSnackbar(response.info, "error", "top");
    }
    dialogVisible.value = false;
    emit("refresh");
  } catch (e) {
    console.error(e);
  }
};
</script>

<template>
  <div class="flex items-center gap-3">
    <v-btn v-if="self" color="primary" rounded :size="screenMode === 'phone' ? 'small' : 'default'"
      @click="dialogVisible = true">
      编辑资料
    </v-btn>

    <!-- <v-avatar
      size="80"
      rounded="0"
      class="cursor-pointer"
      @click="openQrcode"
    >
      <v-img :src="qrcodeUrl" />
    </v-avatar> -->

    <!-- Dialog -->
    <v-dialog v-model="dialogVisible" :max-width="screenMode === 'phone' ? 350 : 500">
      <v-card>
        <v-card-title class="text-h6">用户设置</v-card-title>

        <v-tabs v-model="activeTab" bg-color="transparent" grow>
          <v-tab value="userinfo">用户信息</v-tab>
          <v-tab value="resetpass">重置密码</v-tab>
        </v-tabs>

        <v-card-text>
          <!-- 用户信息 -->
          <v-window color="primary" v-model="activeTab">
            <v-window-item value="userinfo" theme="primary">
              <div class="flex justify-center my-3">
                <AvatarUpload class="elevation-1 rounded-pill" v-model="userInfo.avatar" />
              </div>

              <v-text-field v-model="userInfo.nickname" label="昵称" placeholder="请输入昵称" density="comfortable" />
              <v-text-field v-model="userInfo.slogan" label="签名" placeholder="请输入签名" density="comfortable" />

              <div class="flex justify-end gap-2 mt-4">
                <v-btn variant="text" @click="dialogVisible = false">
                  取消
                </v-btn>
                <v-btn color="primary" @click="updateUserInfo">
                  保存
                </v-btn>
              </div>
            </v-window-item>

            <!-- 重置密码 -->
            <v-window-item value="resetpass">
              <v-text-field v-model="resetForm.password_old" label="旧密码" type="password" density="comfortable" />
              <v-text-field v-model="resetForm.password" label="新密码" type="password" density="comfortable" />
              <v-text-field v-model="resetForm.password_repeat" label="确认密码" type="password" density="comfortable" />

              <div class="flex justify-end gap-2 mt-4">
                <v-btn variant="text" @click="dialogVisible = false">
                  取消
                </v-btn>
                <v-btn color="error" @click="onChangePassword">
                  重置
                </v-btn>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.mt-4 {
  margin-top: 16px;
}

.my-3 {
  margin-top: 12px;
  margin-bottom: 12px;
}
</style>
