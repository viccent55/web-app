<script setup lang="ts">
  import { ref, onMounted } from "vue";

  const formRef = ref();
  const STORAGE_KEY = "xhs_survey_shown";

  /* Form data */
  const state = reactive({
    dialog: false,
    loading: false,
    form: {
      system: "",
      openSpeed: "",
      imageSpeed: "",
      videoSpeed: "",
      shareOk: "",
      registerOk: "",
      loginOk: "",
      suggestion: "",
    },
  });

  /* Validation rules */
  const required = (v: string) => !!v || "必填";

  const open = () => {
    state.dialog = true;
  };
  const resetForm = () => {
    state.form = {
      system: "",
      openSpeed: "",
      imageSpeed: "",
      videoSpeed: "",
      shareOk: "",
      registerOk: "",
      loginOk: "",
      suggestion: "",
    };
  };

  const onClose = () => {
    state.dialog = false;
    resetForm();
  };
  /* Submit */
  const submit = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    state.loading = true;
    try {
      console.log("Survey submission:", state.form);
      state.dialog = false;
    } finally {
      state.loading = false;
    }
  };
  /* Displayed only once per tab */
  onMounted(() => {
    if (typeof window === "undefined") return;
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      state.dialog = true;
      sessionStorage.setItem(STORAGE_KEY, "1");
    }
  });
  defineExpose({ open });
</script>

<template>
  <v-dialog
    v-model="state.dialog"
    max-width="520"
    scrollable
  >
    <v-card rounded="xl">
      <!-- Header -->
      <v-card-title
        class="text-h6 font-weight-bold d-flex justify-space-between"
      >
        <span>📋 小红书使用体验调查</span>
        <v-btn
          icon="mdi-close"
          density="comfortable"
          @click="onClose"
        />
      </v-card-title>

      <!-- Telegram (UNCHANGED) -->
      <v-card-subtitle class="text-body-2">
        <a
          class="text-primary"
          href="https://t.me/hanfei589"
          target="_blank"
          rel="noopener"
        >
          @hanfei589
        </a>
        ｜感谢您的反馈
      </v-card-subtitle>

      <!-- Form -->
      <v-card-text class="pt-2">
        <v-form ref="formRef">
          <v-row>
            <!-- Section: Device -->
            <v-col cols="12">
              <div class="font-weight-medium text-subtitle-1">📱 使用环境</div>

              <v-radio-group
                v-model="state.form.system"
                :rules="[required]"
                hide-details="auto"
                density="compact"
                inline
                color="primary"
              >
                <v-radio
                  label="苹果（iOS）"
                  value="ios"
                />
                <v-radio
                  label="安卓（Android）"
                  value="android"
                />
                <v-radio
                  label="网页（Web）"
                  value="web"
                />
              </v-radio-group>
            </v-col>
            <v-col cols="12">
              <!-- Section: Performance -->
              <div class="font-weight-medium text-subtitle-1">⚡ 性能体验</div>
              <div class="font-weight-medium text-body-2 mt-0 ml-6 text-grey">
                打开 App
              </div>
              <v-radio-group
                v-model="state.form.openSpeed"
                :rules="[required]"
                inline
                density="compact"
                hide-details="auto"
                color="primary"
              >
                <v-radio
                  label="很快"
                  value="very_fast"
                />
                <v-radio
                  label="快"
                  value="fast"
                />
                <v-radio
                  label="慢"
                  value="slow"
                />
                <v-radio
                  label="很慢"
                  value="very_slow"
                />
              </v-radio-group>
            </v-col>
            <v-col cols="12">
              <div class="font-weight-medium text-subtitle-1">🏞️ 图片加载</div>
              <v-radio-group
                v-model="state.form.imageSpeed"
                :rules="[required]"
                inline
                density="compact"
                hide-details="auto"
                color="primary"
              >
                <v-radio
                  label="很快"
                  value="very_fast"
                />
                <v-radio
                  label="快"
                  value="fast"
                />
                <v-radio
                  label="慢"
                  value="slow"
                />
                <v-radio
                  label="很慢"
                  value="very_slow"
                />
              </v-radio-group>
            </v-col>
            <v-col cols="12">
              <div class="font-weight-medium text-subtitle-1">🎦 视频播放</div>
              <v-radio-group
                v-model="state.form.videoSpeed"
                :rules="[required]"
                inline
                density="compact"
                hide-details="auto"
                color="primary"
              >
                <v-radio
                  label="很快"
                  value="very_fast"
                />
                <v-radio
                  label="快"
                  value="fast"
                />
                <v-radio
                  label="慢"
                  value="slow"
                />
                <v-radio
                  label="很慢"
                  value="very_slow"
                />
              </v-radio-group>
            </v-col>
          </v-row>

          <!-- Section: Features -->
          <div class="text-subtitle-2 font-weight-medium mt-4 mb-2">
            ✅ 功能是否正常
          </div>

          <v-row dense>
            <v-col
              cols="12"
              md="4"
            >
              <div class="text-subtitle-2 mb-1">分享</div>
              <v-radio-group
                v-model="state.form.shareOk"
                :rules="[required]"
                inline
                density="compact"
                color="primary"
              >
                <v-radio
                  label="是"
                  value="yes"
                />
                <v-radio
                  label="否"
                  value="no"
                />
              </v-radio-group>
            </v-col>

            <v-col
              cols="12"
              md="4"
            >
              <div class="text-subtitle-2 mb-1">注册</div>
              <v-radio-group
                v-model="state.form.registerOk"
                :rules="[required]"
                inline
                density="compact"
                color="primary"
              >
                <v-radio
                  label="是"
                  value="yes"
                />
                <v-radio
                  label="否"
                  value="no"
                />
              </v-radio-group>
            </v-col>

            <v-col
              cols="12"
              md="4"
            >
              <div class="text-subtitle-2 mb-1">登录</div>
              <v-radio-group
                v-model="state.form.loginOk"
                :rules="[required]"
                inline
                density="compact"
                color="primary"
              >
                <v-radio
                  label="是"
                  value="yes"
                />
                <v-radio
                  label="否"
                  value="no"
                />
              </v-radio-group>
            </v-col>
          </v-row>

          <!-- Section: Suggestion -->
          <v-textarea
            v-model="state.form.suggestion"
            label="其他问题 / 建议（可选）"
            rows="2"
            variant="outlined"
            density="compact"
            color="primary"
            hide-details="auto"
            class="mt-2"
          />
        </v-form>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn
          density="comfortable"
          variant="text"
          @click="onClose"
        >
          跳过
        </v-btn>
        <v-btn
          density="comfortable"
          color="primary"
          variant="elevated"
          :loading="state.loading"
          @click="submit"
        >
          提交
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
