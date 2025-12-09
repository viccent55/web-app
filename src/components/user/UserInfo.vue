<script setup lang="ts">
import Dialog from "./Dialog.vue";
import type { UserDetailInfo } from "@/types/info";
import { useUserStore } from "@/stores/user";
import { computed } from "vue";
import Image from "@/components/Image.vue";
import { screenMode } from "@/hooks/useScreenMode";

import useVariable from "@/composables/useVariable";
import useSnackbar from "@/composables/useSnackbar";

const props = defineProps<{ user: UserDetailInfo; loading: boolean }>();
const emits = defineEmits(["click-follow", "click-report", "refresh"]);
const userStore = useUserStore();
const { onCopy, storeUser } = useVariable();
const snackbar = useSnackbar();

const self = computed(() => userStore.useId === props.user.id);

const gravatarUrl = computed(() => {
  return `/icons/icon-128.webp`;
});

function clickFollow() {
  emits("click-follow", props.user);
  props.user.isFollow = !props.user.isFollow;
}

const onCopyCode = async (code: string) => {
  await onCopy(code);
  snackbar.showSnackbar("用户名已复制！", "success", "center");
};
const isConfirm = ref(false);
const openLogout = async () => {
  isConfirm.value = !isConfirm.value;
};

const handleConfirm = () => {
  console.log("User confirmed ✅");
  snackbar.showSnackbar("✅ 登出成功", "success");
  storeUser.logout();
};

const handleCancel = () => {
  console.log("User cancelled ❌");
};
</script>

<template>
  <v-card flat class="pa-4 w-100" rounded="xl" color="transparent">
    <div class="d-flex align-start" style="max-width: 800px; margin: auto">
      <!-- Avatar -->
      <div class="mr-md-5 mr-3">
        <v-avatar :size="screenMode === 'phone' ? 80 : 120" class="elevation-2">
          <template v-if="props.user.avatar">
            <Image :src="props.user.avatar" cover height="100%" width="100%" />
          </template>
          <template v-else>
            <v-img :src="gravatarUrl" cover />
          </template>
        </v-avatar>
      </div>

      <!-- Basic Info -->
      <div class="flex-grow-1">
        <div class="d-flex flex-column">
          <div>
            <div class="text-h6 font-weight-bold d-flex align-center justify-space-between w-100">
              {{ props.user.nickname }}
              <Dialog :user="props.user" :self="self" @refresh="() => emits('refresh')" />

              <FollowButton v-if="!self" :loading="props.loading" :is-follow="props.user.isFollow"
                @click="clickFollow" />
            </div>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center ga-1">
                小红书号: {{ props.user.invite_code }}
                <v-icon size="small" class="ml-1 cursor-pointer" color="primary" @click="onCopyCode(user.invite_code)">
                  mdi-content-copy
                </v-icon>
              </div>
              <!-- <v-btn
                v-if="self"
                color="error"
                variant="text"
                @click="openLogout"
              >
                登出
                <v-icon end>mdi-power</v-icon>
              </v-btn> -->
            </div>
          </div>

          <div class="mt-3 text-body-2 text-grey-darken-1">
            {{ props.user.slogan || "还没有简介" }}
          </div>

          <!-- Interactions -->
          <!-- <div class="d-flex ga-5 mt-4">
            <div class="text-center">
              <div class="text-subtitle-1 font-weight-medium">
                {{ props.user.subscribed }}
              </div>
              <div class="text-caption text-grey">关注</div>
            </div>
            <div class="text-center">
              <div class="text-subtitle-1 font-weight-medium">
                {{ props.user.inviter }}
              </div>
              <div class="text-caption text-grey">粉丝</div>
            </div>
            <div class="text-center">
              <div class="text-subtitle-1 font-weight-medium">
                {{ props.user.invite_count }}
              </div>
              <div class="text-caption text-grey">获赞与收藏</div>
            </div>
          </div> -->
        </div>
      </div>
    </div>
    <ConfirmDialog v-model="isConfirm" title="警告!" description="你确定要退出吗？" @confirm="handleConfirm"
      @cancel="handleCancel" />
  </v-card>
</template>

<style scoped lang="scss">
.info-wrapper {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
