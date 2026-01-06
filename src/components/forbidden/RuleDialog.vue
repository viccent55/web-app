<script lang="ts" setup>
  import { checkPermissions } from "@/hooks/usePermisions";
  import { PERMISSION } from "@/common/permision";
  import useVariable from "@/composables/useVariable";
  import { getCurrentDomain } from "@/service/index";
  import useSnackbar from "@/composables/useSnackbar";
  import { openPage } from "@/service";
  import { getConfigs } from "@/service/user";

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
  const state = reactive({
    gameRegLink: "",
    loading: false,
  });

  watch(
    () => router.currentRoute,
    (val) => {
      if (val.value?.fullPath == "/forbidden") {
        if (storeUser.userInfo?.invite_count < 3 || !storeUser.isLogin)
          isVisible.value = true;
      }
    },
    {
      deep: true,
    }
  );
  const getGameRegister = async () => {
    try {
      state.loading = true;
      const res = await getConfigs({
        name: "game_reg_url",
      });
      state.gameRegLink = res.data?.game_reg_url ?? "";
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      state.loading = false;
    }
  };
  const onRegister = () => {
    checkPermissions(PERMISSION.User, () => {
      openPage(
        `${state.gameRegLink}?userid=${storeUser.useId}&chan=${storeUser.visitCode}`
      );
    });
  };
  const onInvite = () => {
    checkPermissions(PERMISSION.User, () => {
      onCopy(
        `${getCurrentDomain()}/?invite_code=${storeUser.userInfo.invite_code}`
      );
      snackbar.showSnackbar("邀请码已复制！", "success", "center");
    });
  };
  onMounted(() => getGameRegister());
</script>
<template>
  <v-card
    flat
    max-width="500px"
  >
    <v-card-text>
      <div class="text-center text-primary text-subtitle-1">
        <div class="text-h6 font-weight-bold mb-2">全球禁区中心包含:</div>
        真实强奸，稀缺幼女，萝莉岛，N号房，缅北内
        幕，血腥战场，新冠真相，真实奸杀，封杀事件 累计资源超300W部视频
      </div>

      <div class="d-flex flex-column my-3">
        <div class="text-center text- text-subtitle-1">
          分享邀请
          <strong class="text-error">3</strong>
          个好友或分享
          <strong class="text-error">2</strong>
          个好友加注册
        </div>
        <div class="text-center text-subtitle-2">可解锁全站视频无限观看</div>
      </div>

      <v-card-actions>
        <v-row dense>
          <v-col cols="6">
            <v-btn
              color="primary"
              block
              rounded="xl"
              size="large"
              variant="elevated"
              @click="onRegister"
              style="
                background: linear-gradient(135deg, #6c13d9 0%, #3794ff 100%);
                color: #fff;
              "
            >
              <v-img
                width="32px"
                src="/forbidden/game.png"
              ></v-img>
              去注册
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn
              size="large"
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
