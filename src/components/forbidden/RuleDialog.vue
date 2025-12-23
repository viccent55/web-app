<script lang="ts" setup>
  import { checkPermissions } from "@/hooks/usePermisions";
  import { PERMISSION } from "@/common/permision";
  import useVariable from "@/composables/useVariable";
  import { getCurrentDomain } from "@/service/index";
  import useSnackbar from "@/composables/useSnackbar";
  import { openLoginDialog } from "@/hooks/useLoginDialog";

  const props = defineProps({
    modelValue: Boolean,
  });

  const { router, storeUser, onCopy } = useVariable();
  const snackbar = useSnackbar();
  const emit = defineEmits(["update:modelValue", "select", "leave"]);
  const isVisible = computed({
    get: () => props.modelValue,
    set: (v) => emit("update:modelValue", v),
  });
  watch(
    () => router.currentRoute,
    (val) => {
      if (val.value?.fullPath == "/forbidden") {
        if (storeUser.userInfo?.invite_count < 5 || !storeUser.isLogin)
          isVisible.value = true;
      }
    },
    {
      deep: true,
    }
  );

  const onGotoRegister = (url: string = "") => {
    openLoginDialog();
  };
  const onInvite = () => {
    checkPermissions(PERMISSION.User, () => {
      onCopy(
        `${getCurrentDomain()}/?invite_code=${storeUser.userInfo.invite_code}`
      );
      snackbar.showSnackbar("邀请码已复制！", "success", "center");
    });
  };
</script>
<template>
  <v-card
    flat
    max-width="500px"
  >
    <v-card-text>
      <div class="text-center text-primary text-subtitle-1">
        全球禁区中心包含: 真实强奸，稀缺幼女，萝莉岛，N号房，缅北内
        幕，血腥战场，新冠真相，真实奸杀，封杀事件 累计资源超300W部视频
      </div>

      <div class="d-flex flex-column my-2">
        <div class="text-center text-warning text-subtitle-1">
          成功邀请3人或注册app
        </div>
        <div class="text-center text-warning text-subtitle-2">
          即可免费观看禁区内容
        </div>
      </div>

      <v-card-actions>
        <v-row dense>
          <v-col cols="6">
            <v-btn
              color="primary"
              block
              rounded="xl"
              variant="elevated"
              @click="onGotoRegister"
            >
              去注册
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn
              color="primary"
              block
              rounded="xl"
              variant="elevated"
              @click="onInvite"
            >
              立即邀请
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card-text>
  </v-card>
</template>
<style scoped lang="scss"></style>
