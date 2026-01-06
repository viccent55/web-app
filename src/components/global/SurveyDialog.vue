<script setup lang="ts">
  import { ref, onMounted, reactive } from "vue";
  import { useDisplay } from "vuetify";
  import { survey, upload } from "@/service/survey";
  import useSnackbar from "@/composables/useSnackbar";
  import Image from "../Image.vue";

  const formRef = ref();
  const STORAGE_KEY = "xhs_survey_shown";
  const { smAndDown } = useDisplay();
  /* Form data */
  const state = reactive({
    dialog: false,
    loading: false,
    form: {
      form_title: "有奖反馈",
      visitor: "",
      usage_environment: "",
      performance_experience: "",
      image_loading: "",
      video_playback: "",
      functional_status: {
        share: "normal",
        register: "normal",
        login: "normal",
      },
      feedback_type: "crash",
      issue_description: "",
      upload_images: [] as any[],
    },
  });

  /* Validation rules */
  const required = (v: string) => !!v || "必填";

  const open = () => {
    state.dialog = true;
  };
  const resetForm = () => {
    state.form = {
      form_title: "有奖反馈",
      visitor: "",
      usage_environment: "",
      performance_experience: "",
      image_loading: "",
      video_playback: "",
      functional_status: {
        share: "normal",
        register: "normal",
        login: "normal",
      },
      feedback_type: "crash",
      issue_description: "",
      upload_images: [],
    };
  };
  const storeUser = useUserStore();
  const store = useStore();
  const onClose = () => {
    state.dialog = false;
    resetForm();
  };
  /* Submit */
  const submit = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) {
      snakbar.showSnackbar("请填写完整表单", "warning");
      return;
    }

    state.loading = true;
    try {
      const request = {
        ...state.form,
        visitor: storeUser.visitCode,
      };
      const response = await survey(request);
      console.log(response);
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

  /* Image Upload */
  const fileInput = ref<HTMLInputElement>();

  const triggerUpload = () => {
    fileInput.value?.click();
  };

  const snakbar = useSnackbar();
  const onFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target.files?.length) return;

    const files = Array.from(target.files);

    for (const file of files) {
      // 2MB limit guard
      if (file.size > 2 * 1024 * 1024) {
        snakbar.showSnackbar(`图片超过 2MB ${file.name}`, "warning");
        console.warn("Image exceeds 2MB:", file.name);
        continue;
      }

      try {
        const url = await upload(file);
        // ✅ push returned URL only (API expects string[])
        state.form.upload_images.push(url);
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    // reset input so same file can be selected again
    target.value = "";
  };

  const removeImage = (index: number) => {
    state.form.upload_images.splice(index, 1);
  };
  const snackbar = useSnackbar();
  const joinTG = () => {
    if (!store.configuration?.tg_business) {
      return snackbar.showSnackbar("没有 Telegram 链接", "warning", "center");
    }
    window.open(store.configuration?.tg_business, "_blank");
  };
  function getTelegramUsername(url: string) {
    try {
      return new URL(url).pathname.replace("/", "");
    } catch {
      return "";
    }
  }
  defineExpose({ open });
</script>

<template>
  <v-dialog
    v-model="state.dialog"
    max-width="520"
    :fullscreen="smAndDown"
    scrollable
  >
    <v-card>
      <!-- Header -->
      <v-card-title
        class="text-h6 font-weight-bold d-flex justify-space-between"
      >
        <v-btn
          icon="mdi-chevron-left"
          density="comfortable"
          @click="onClose"
        />
        <span>有奖反馈</span>
        <span></span>
      </v-card-title>

      <!-- Telegram (UNCHANGED) -->
      <v-card-subtitle class="text-body-2">
        <a
          class="text-primary cursor-pointer"
          @click="joinTG"
          target="_blank"
          rel="noopener"
        >
          {{
            getTelegramUsername(store.configuration?.tg_business) ||
            "@hanfei589"
          }}
        </a>
        ｜感谢您的反馈
      </v-card-subtitle>

      <!-- Form -->
      <v-card-text class="pt-2">
        <v-form ref="formRef">
          <v-row>
            <!-- Section: Device -->
            <v-col cols="12">
              <v-card
                class="pa-2"
                color="surface"
              >
                <div class="font-weight-medium text-subtitle-1 mb-1">
                  <v-icon color="primary">mdi-devices</v-icon>
                  使用环境
                </div>
                <v-radio-group
                  v-model="state.form.usage_environment"
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
              </v-card>
            </v-col>
            <v-col cols="12">
              <!-- Section: Performance -->
              <v-card class="pa-2">
                <div class="d-flex align-center ga-2">
                  <div class="font-weight-medium text-subtitle-1">
                    <v-icon color="primary">mdi-speedometer</v-icon>
                    性能体验
                  </div>
                  <div class="font-weight-medium text-body-2 mt-0 text-grey">
                    打开app
                  </div>
                </div>
                <v-radio-group
                  v-model="state.form.performance_experience"
                  :rules="[required]"
                  inline
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
              </v-card>
            </v-col>
            <v-col cols="12">
              <v-card class="pa-2">
                <div class="d-flex align-center ga-2">
                  <div class="font-weight-medium text-subtitle-1">
                    <v-icon color="primary">mdi-image</v-icon>
                    图片加载
                  </div>
                  <div class="font-weight-medium text-body-2 mt-0 text-grey">
                    视频封面或详情图
                  </div>
                </div>
                <v-radio-group
                  v-model="state.form.image_loading"
                  :rules="[required]"
                  inline
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
              </v-card>
            </v-col>
            <v-col cols="12">
              <v-card class="pa-2">
                <div class="d-flex align-center ga-2">
                  <div class="font-weight-medium text-subtitle-1">
                    <v-icon color="primary">mdi-video</v-icon>
                    视频播放
                  </div>
                  <div class="font-weight-medium text-body-2 mt-0 text-grey">
                    视频播放
                  </div>
                </div>
                <v-radio-group
                  v-model="state.form.video_playback"
                  :rules="[required]"
                  inline
                  hide-details="auto"
                  color="primary"
                >
                  <v-radio
                    label="很快"
                    value="crash"
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
              </v-card>
            </v-col>
            <v-col cols="12">
              <v-card class="pa-2">
                <div class="text-subtitle-1 font-weight-medium mt-4 mb-2">
                  ✅ 功能是否正常
                </div>
                <v-row dense>
                  <v-col
                    cols="12"
                    md="4"
                  >
                    <div class="text-subtitle-2 mb-1">分享</div>
                    <v-radio-group
                      v-model="state.form.functional_status.share"
                      :rules="[required]"
                      inline
                      color="primary"
                    >
                      <v-radio
                        label="是"
                        value="normal"
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
                      v-model="state.form.functional_status.register"
                      :rules="[required]"
                      inline
                      color="primary"
                    >
                      <v-radio
                        label="是"
                        value="normal"
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
                      v-model="state.form.functional_status.login"
                      :rules="[required]"
                      inline
                      color="primary"
                    >
                      <v-radio
                        label="是"
                        value="normal"
                      />
                      <v-radio
                        label="否"
                        value="no"
                      />
                    </v-radio-group>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
            <v-col cols="12">
              <v-card class="pa-2">
                <div class="font-weight-medium text-subtitle-1">反馈类型</div>
                <v-radio-group
                  v-model="state.form.feedback_type"
                  :rules="[required]"
                  inline
                  hide-details="auto"
                  color="primary"
                >
                  <v-radio
                    label="页面闪退"
                    value="crash"
                  />
                  <v-radio
                    label="App不好用"
                    value="app_not_working"
                  />
                  <v-radio
                    label="播放卡顿"
                    value="playback_stuttering"
                  />
                  <v-radio
                    label="账号问题"
                    value="account_issue"
                  />
                  <v-radio
                    label="界面美观"
                    value="good_ui"
                  />
                  <v-radio
                    label="其他反馈"
                    value="others"
                  />
                </v-radio-group>
              </v-card>
            </v-col>
            <v-col cols="12">
              <!-- Section: Suggestion -->
              <v-card class="pa-2">
                <div class="text-subtitle-1 mb-2">问题与描述</div>
                <v-textarea
                  v-model="state.form.issue_description"
                  label="其他问题 / 建议（可选）"
                  rows="3"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  counter
                  hide-details="auto"
                />
              </v-card>
              <div class="font-weight-medium text-subtitle-1 my-2">
                上传图片（图片不超过2w）
              </div>
              <div class="d-flex flex-wrap ga-2 ml-2">
                <div
                  class="d-flex align-center justify-center rounded-lg border border-dashed cursor-pointer"
                  style="width: 80px; height: 80px; border-color: #ccc"
                  v-ripple
                  @click="triggerUpload"
                >
                  <v-icon color="grey-darken-1">mdi-plus</v-icon>
                </div>
                <div
                  v-for="(img, idx) in state.form.upload_images"
                  :key="idx"
                  class="position-relative"
                  style="width: 80px; height: 80px"
                >
                  <Image
                    :src="img"
                    width="100%"
                    height="100%"
                    class="rounded-lg"
                    cover
                  />
                  <v-btn
                    icon="mdi-close"
                    size="x-small"
                    color="error"
                    variant="flat"
                    class="position-absolute"
                    style="top: -6px; right: -6px; z-index: 1"
                    @click="removeImage(idx)"
                  />
                </div>

                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  multiple
                  class="d-none"
                  @change="onFileChange"
                />
              </div>
            </v-col>
            <v-col cols="12">
              <span class="text-primary">反馈之后联系在线客服领取奖励！</span>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="px-4 pb-4">
        <v-btn
          size="large"
          rounded="xl"
          density="comfortable"
          color="primary"
          variant="flat"
          block
          :loading="state.loading"
          @click="submit"
        >
          提交
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
