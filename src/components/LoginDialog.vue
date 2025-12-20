<script setup lang="ts">
  import { ref, reactive, watch } from "vue";
  import { useUserStore } from "@/stores/user";
  import { useStore } from "@/stores";
  import { login, prepareRegister } from "@/service/auth";
  import { closeLoginDialog, loginDialogVisible } from "@/hooks/useLoginDialog";
  import { screenMode } from "@/hooks/useScreenMode";
  import { generateCode } from "@/utils/toolsValidate";
  import useVariable from "@/composables/useVariable";
  import ForgotPassword from "./ForgotPassword.vue";
  import { openPage } from "@/service";
  import useSnackbar from "@/composables/useSnackbar";

  const dialogMode = ref<"all" | "left" | "right">();
  const store = useStore();
  const storeUser = useUserStore();
  const snackbar = useSnackbar();

  const state = reactive({
    login: { email: "", password: "" },
    register: {
      email: "",
      password: "",
      password_repeat: "",
      invite_code: "",
      visitor: "",
      subscribed: 0,
    },
    isLogin: true,
    loading: false,
  });

  const { onCopy, route } = useVariable();

  watch(
    () => screenMode.value,
    (value, oldValue) => {
      if (!oldValue) {
        dialogMode.value = screenMode.value === "pc" ? "all" : "right";
      }
      if (value === "pc") dialogMode.value = "all";
      else if (oldValue === "pc") dialogMode.value = "right";
    },
    { immediate: true }
  );

  const handleClose = () => {
    state.isLogin = true;
    closeLoginDialog();
  };

  const resetRegisterForm = () => {
    state.register.email = "";
    state.register.password = "";
    state.register.password_repeat = "";
    state.register.invite_code = "";
    state.register.subscribed = 0;
  };

  const onLogin = async () => {
    if (!state.login.email)
      return snackbar.showSnackbar("请输入您的电子邮件", "warning", "top");
    if (!state.login.password)
      return snackbar.showSnackbar("请输入您的密码", "warning", "top");

    try {
      state.loading = true;
      const response = await login(state.login);
      if (response.errcode === 0) {
        storeUser.login(response.data?.token, response.data?.userinfo);
        snackbar.showSnackbar("登录成功", "success", "top");
        closeLoginDialog();
      } else {
        snackbar.showSnackbar(response.info, "error", "top");
      }
    } catch (e) {
      console.error("Error during login:", e);
    } finally {
      state.loading = false;
    }
  };

  const onPrepareRegister = async () => {
    if (!state.register.email)
      return snackbar.showSnackbar("请输入您的电子邮件", "warning", "top");
    if (!state.register.password || !state.register.password_repeat)
      return snackbar.showSnackbar("请输入您的密码", "warning", "top");
    if (state.register.password !== state.register.password_repeat)
      return snackbar.showSnackbar("两次密码不一致", "warning", "top");
    try {
      state.loading = true;
      const request = {
        ...state.register,
        visitor: storeUser.isUseToRegister
          ? generateCode()
          : storeUser.visitCode,
        chan: store.chan ?? "",
      };
      const response = await prepareRegister(request);
      if (response.errcode === 0) {
        snackbar.showSnackbar("已申请注册!", "success", "top");
        resetRegisterForm();
        state.isLogin = true;
        storeUser.isUseToRegister = true;
      } else {
        snackbar.showSnackbar(response.info, "error", "top");
      }
    } catch (e) {
      console.error("Error during register:", e);
    } finally {
      state.loading = false;
    }
  };

  const onAuth = () => {
    if (state.isLogin) onLogin();
    else onPrepareRegister();
  };

  const forgotPasswordRef = ref();
  const openFogotDialog = () => {
    loginDialogVisible.value = false;
    forgotPasswordRef.value.openDialog();
  };
  watch(
    () => route.query.invite_code,
    (v) => {
      if (v) {
        state.register.invite_code = (v as string) || "";
      }
    },
    {
      immediate: true,
    }
  );
  const { showChatWidget } = useSnackbar();
  const onLiveChat = () => {
    showChatWidget();
  };
</script>

<template>
  <v-dialog
    v-model="loginDialogVisible"
    max-width="500"
  >
    <v-card
      rounded="xl"
      :loading="state.loading"
    >
      <v-card-title class="d-flex justify-end pb-0 mb-0 py-2">
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="handleClose"
        />
      </v-card-title>
      <v-card-text class="pt-0">
        <!-- Tabs -->
        <v-tabs
          v-model="state.isLogin"
          class="mb-md-4 mb-3"
          grow
          color="primary"
          :height="$vuetify.display.mobile ? '30' : '40'"
        >
          <v-tab :value="true">登录</v-tab>
          <v-tab :value="false">注册</v-tab>
        </v-tabs>

        <v-tabs-window v-model="state.isLogin">
          <!-- Login -->
          <v-tabs-window-item :value="true">
            <v-form class="mt-2">
              <v-text-field
                v-model="state.login.email"
                label="邮箱或用户名"
                type="email"
                variant="outlined"
                density="compact"
              />
              <v-text-field
                v-model="state.login.password"
                label="密码"
                type="password"
                variant="outlined"
                density="compact"
                @keyup.enter="onAuth"
              />
              <v-btn
                block
                color="error"
                class="mt-md-4 mt-0"
                size="default"
                rounded="pill"
                @click="onAuth"
                :loading="state.loading"
              >
                登录
              </v-btn>
            </v-form>
          </v-tabs-window-item>

          <!-- Register -->
          <v-tabs-window-item :value="false">
            <v-form class="mt-2">
              <v-text-field
                v-model="state.register.email"
                label="邮箱或用户名 (最少6位)"
                type="email"
                variant="outlined"
                density="compact"
              />
              <v-text-field
                v-model="state.register.password"
                label="密码"
                type="password"
                variant="outlined"
                density="compact"
              />
              <v-text-field
                v-model="state.register.password_repeat"
                label="重复密码"
                type="password"
                variant="outlined"
                density="compact"
              />
              <v-text-field
                v-model="state.register.invite_code"
                label="邀请码(没有可不填)"
                variant="outlined"
                density="compact"
              />
              <v-btn
                block
                color="error"
                size="default"
                rounded="pill"
                @click="onPrepareRegister"
                :loading="state.loading"
              >
                注册
              </v-btn>
            </v-form>
          </v-tabs-window-item>
        </v-tabs-window>

        <!-- Extra actions -->
        <div class="mt-md-3 mt-2">
          <v-row dense>
            <v-col cols="6">
              <v-btn
                v-if="state.isLogin"
                block
                color="secondary"
                variant="tonal"
                size="default"
                rounded="pill"
                @click="openFogotDialog"
              >
                忘记密码？
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                v-if="state.isLogin"
                block
                color="primary"
                class="mb-2 elevation-0"
                rounded="pill"
                @click="onLiveChat"
              >
                <v-icon size="20">mdi-headset</v-icon>
                <span class="ml-2">在线客服</span>
              </v-btn>
            </v-col>
          </v-row>
          <v-btn
            v-if="screenMode == 'phone'"
            block
            color="warning"
            variant="flat"
            rounded="xl"
            class="mt-2"
            @click="openPage(store.configuration?.download_app_url)"
          >
            App下载
          </v-btn>
        </div>

        <!-- Mobile extra links -->
        <div
          v-if="screenMode === 'phone'"
          class="mt-2"
        >
          <v-list
            density="compact"
            class="pa-0"
          >
            <v-list-item class="px-1 py-0">
              <v-list-item-subtitle style="word-break: break-all">
                <strong>备用地址：</strong>
                <a
                  :href="store.configuration?.home_url"
                  target="_blank"
                  class="text-primary f14"
                >
                  {{ store.configuration?.home_url }}
                </a>
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item class="px-1 py-0">
              <v-list-item-subtitle style="word-break: break-all">
                <strong>备用地址：</strong>
                <a
                  :href="store.configuration?.domain_next"
                  target="_blank"
                  class="text-primary f14"
                >
                  {{ store.configuration?.domain_next }}
                </a>
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item class="px-1 py-0">
              <v-list-item-subtitle style="word-break: break-all">
                <strong>永久域名：</strong>
                <a
                  :href="store.configuration?.domain_latest"
                  target="_blank"
                  class="text-primary"
                >
                  {{ store.configuration?.domain_latest }}
                </a>
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item class="px-1 py-0">
              <v-list-item-subtitle
                @click="
                  () => {
                    onCopy(store.configuration?.email);
                    snackbar.showSnackbar('复制成功', 'success', 'top');
                  }
                "
                style="word-break: break-all"
              >
                <strong>防失联邮箱：</strong>
                <span class="text-primary">
                  {{ store.configuration?.email }}asdfsadf
                </span>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <ForgotPassword
    ref="forgotPasswordRef"
    @open="loginDialogVisible = true"
  />
</template>
