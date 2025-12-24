<script setup lang="ts">
  import { computed } from "vue";
  import { openLoginDialog } from "@/hooks/useLoginDialog";
  import { checkPermissions } from "@/hooks/usePermisions";
  import { PERMISSION } from "@/common/permision";
  import useVariable from "@/composables/useVariable";
  import { getCurrentDomain, openPage } from "@/service";
  import useSnackbar from "@/composables/useSnackbar";
  import { getConfigs } from "@/service/user";

  const props = withDefaults(
    defineProps<{
      modelValue: boolean;
    }>(),
    {
      modelValue: false,
    }
  );
  const { store, onCopy, storeUser } = useVariable();
  const snackbar = useSnackbar();
  const emit = defineEmits(["update:modelValue", "register", "share"]);
  const state = reactive({
    gameRegLink: "",
    loading: false,
  });

  const visible = computed({
    get: () => props.modelValue,
    set: (v) => emit("update:modelValue", v),
  });
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
  function appendQuery(url: string, params: Record<string, string | number>) {
    if (!url) return url;

    const [base, hash = ""] = url.split("#");

    // build query string
    const query = new URLSearchParams(params).toString();

    // no hash route
    if (!hash) {
      return base + (base.includes("?") ? "&" : "?") + query;
    }

    // hash route (SPA style)
    const hashHasQuery = hash.includes("?");

    return `${base}#${hash}${hashHasQuery ? "&" : "?"}${query}`;
  }

  const onRegister = () => {
    checkPermissions(PERMISSION.User, () => {
      openPage(
        appendQuery(state.gameRegLink, {
          userid: storeUser.useId,
        })
      );
    });
  };

  const onShare = () => {
    checkPermissions(PERMISSION.User, () => {
      onCopy(
        `${getCurrentDomain()}/?invite_code=${storeUser.userInfo.invite_code}`
      );
      snackbar.showSnackbar("邀请码已复制！", "success", "center");
    });
  };
</script>

<template>
  <v-dialog
    v-model="visible"
    max-width="360"
    @after-enter="getGameRegister"
  >
    <v-card
      rounded="xl"
      elevation="0"
      class="pa-5 text-center"
      color="surface"
      :loading="state.loading"
    >
      <div class="text-h6 font-weight-bold">温馨提示</div>

      <!-- ICON -->
      <div class="icon-wrap mt-2">
        <v-icon
          size="40"
          color="#FFC680"
        >
          mdi-lightbulb-outline
        </v-icon>
      </div>

      <!-- SUB MESSAGE -->
      <div class="text-body-2">
        {{ store.ruleTip.text }}
      </div>

      <!-- ACTIONS -->
      <div class="actions">
        <v-btn
          class="action-btn"
          color="red"
          variant="flat"
          rounded="pill"
          :disabled="state.loading"
          @click="onRegister"
        >
          去注册
        </v-btn>

        <v-btn
          class="action-btn"
          color="red"
          variant="flat"
          rounded="pill"
          @click="onShare"
        >
          立即分享
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
  /* Icon circle */
  .icon-wrap {
    width: 75px;
    height: 75px;
    border-radius: 50%;
    background-color: #979797;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  /* Messages */
  .message {
    line-height: 1.6;
    margin-bottom: 10px;
  }

  /* Actions */
  .actions {
    display: flex;
    gap: 14px;
    margin-top: 22px;
  }

  .action-btn {
    flex: 1;
    height: 44px;
    font-size: 15px;
    font-weight: 600;
  }
</style>
