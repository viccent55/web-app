<script setup lang="ts">
  import useSnackbar from "@/composables/useSnackbar";

  const modelValue = defineModel<boolean>({ default: true });

  const snackbar = useSnackbar();
  const store = useStore();
  const joinTG = () => {
    if (!store.configuration?.tg_business) {
      return snackbar.showSnackbar("没有 Telegram 链接", "warning", "center");
    }
    window.open(store.configuration?.tg_business, "_blank");
  };

  const joinTudou = () => {
    window.open("https://your-tudou-link.com", "_blank");
  };

  const close = () => {
    modelValue.value = false;
  };
</script>

<template>
  <v-dialog
    v-model="modelValue"
    max-width="450"
    transition="dialog-scale-transition"
    color="surface"
  >
    <v-card class="rounded-lg">
      <!-- Title -->
      <v-card-title class="d-flex justify-center align-center ga-2 mt-4">
        <v-icon color="amber">mdi-account-group</v-icon>
        <span class="title-text">加入福利群</span>
      </v-card-title>

      <!-- Description -->
      <v-card-text class="text-center">
        <v-row dense>
          <v-col
            cols="12"
            class="mb-8"
          >
            <div class="f16">
              <span>加入福利群，开车资源享不停，</span>
              <br />
              赶快加入吧！
            </div>
          </v-col>
          <v-col cols="6">
            <v-btn
              color="primary"
              rounded="xl"
              @click="joinTG"
            >
              <div class="d-flex align-center ga-2">
                <v-avatar
                  size="28"
                  color="white"
                >
                  <svg
                    class="text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                  >
                    <path
                      d="M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56-.72 0-.6-.27-.84-.95L6.3 13.7l-5.45-1.7c-1.18-.35-1.19-1.16.26-1.75l21.26-8.2c.97-.43 1.9.24 1.53 1.73z"
                    />
                  </svg>
                </v-avatar>
                <span>加入TG福利群</span>
              </div>
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn
              color="primary"
              rounded="xl"
              @click="joinTudou"
            >
              <div class="d-flex align-center ga-2">
                <v-avatar
                  size="28"
                  color="white"
                >
                  🥔
                </v-avatar>
                <span>加入土豆福利群</span>
              </div>
            </v-btn>
          </v-col>
          <v-col cols="12">
            <div class="d-flex text-left ga-2 text-primary mt-2">
              如何下载
              <a
                @click="joinTG"
                target="_blank"
                class="text-primary cursor-pointer"
              >
                Telegram

                <span class="ml-2">土豆</span>
              </a>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <!-- Close -->
      <v-card-actions class="justify-center">
        <v-btn
          icon
          variant="text"
          size="large"
          @click="close"
        >
          <v-icon size="32">mdi-close</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
