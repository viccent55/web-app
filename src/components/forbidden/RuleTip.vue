<script setup lang="ts">
  import { computed } from "vue";
  import { openLoginDialog } from "@/hooks/useLoginDialog";
  import { checkPermissions } from "@/hooks/usePermisions";
  import { PERMISSION } from "@/common/permision";
  import useVariable from "@/composables/useVariable";
  import { getCurrentDomain } from "@/service";
  import useSnackbar from "@/composables/useSnackbar";

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

  const visible = computed({
    get: () => props.modelValue,
    set: (v) => emit("update:modelValue", v),
  });

  const onRegister = () => {
    visible.value = false;
    openLoginDialog();
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
  >
    <v-card
      rounded="xl"
      elevation="0"
      class="pa-5 text-center"
      color="surface"
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
