<script setup lang="ts">
import { ref, reactive } from "vue";
import { forgotPassword, resetPassword } from "@/service/auth";
import { useDisplay } from "vuetify";
import useSnackbar from "@/composables/useSnackbar";

const state = reactive({
  email: "",
  code: "",
  password: "",
  password_repeat: "",
});
const snackbar = useSnackbar();
const forgotPasswordDialog = ref(false);
const { mobile } = useDisplay();

const openDialog = () => {
  forgotPasswordDialog.value = true;
};
defineExpose({ openDialog });

const emit = defineEmits(["open"]);

const getCode = async () => {
  if (!state.email) {
    snackbar.showSnackbar("请输入您的电子邮件", "warning", "top");
    return;
  }
  const response: any = await forgotPassword({ email: state.email });
  if (response.errcode !== 0) {
    snackbar.showSnackbar(response.info, "warning", "top");
    return;
  }
  alert(`邮件已发送至您的邮箱: ${state.email}`);
};

const onResetPassword = async () => {
  if (!state.email) {
    snackbar.showSnackbar("请输入您的电子邮件", "warning", "top");
    return;
  }
  if (!state.code) {
    snackbar.showSnackbar("请输入您的代码", "warning", "top");
    return;
  }
  if (!state.password) {
    snackbar.showSnackbar("请输入您的密码", "warning", "top");
    return;
  }
  if (state.password !== state.password_repeat) {
    snackbar.showSnackbar("两次密码不一致", "warning", "top");
    return;
  }
  const response: any = await resetPassword(state);
  if (response.errcode !== 0) {
    snackbar.showSnackbar(response.info, "top", "error");
    return;
  }
  snackbar.showSnackbar("密码重置成功", "top", "success");
  forgotPasswordDialog.value = false;
  emit("open");
};
</script>

<template>
  <v-dialog v-model="forgotPasswordDialog" persistent max-width="500">
    <v-card class="pa-6 rounded-xl">
      <!-- Close Button -->
      <div class="d-flex justify-end">
        <v-btn icon="mdi-close" variant="text" @click="forgotPasswordDialog = false" />
      </div>

      <v-card-title class="text-center text-h6">忘记密码！</v-card-title>

      <v-card-text>
        <v-form>
          <!-- Email -->
          <v-text-field v-model="state.email" label="电子邮件" type="email" variant="outlined" density="comfortable"
            clearable prepend-inner-icon="mdi-email-outline" />

          <!-- Code with button -->
          <v-text-field v-model="state.code" label="邮箱验证码" variant="outlined" density="comfortable" clearable>
            <template #append-inner>
              <v-btn color="red" variant="tonal" size="small" @click="getCode">
                获取
              </v-btn>
            </template>
          </v-text-field>

          <!-- Password -->
          <v-text-field v-model="state.password" label="新密码" type="password" variant="outlined" density="comfortable"
            prepend-inner-icon="mdi-lock-outline" />

          <!-- Repeat Password -->
          <v-text-field v-model="state.password_repeat" label="重复密码" type="password" variant="outlined"
            density="comfortable" prepend-inner-icon="mdi-lock-check-outline" />
        </v-form>
      </v-card-text>

      <v-card-actions class="pt-2">
        <v-btn block rounded="pill" color="primary" flat size="large" @click="onResetPassword" variant="flat">
          重置密码
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
