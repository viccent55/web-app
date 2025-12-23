<script lang="ts" setup>
  import QrcodeShare from "./QrcodeShare.vue";

  const props = defineProps({
    userInfo: {
      type: Object,
      default: () => ({}),
    },
  });
  const qrcodeShare = useTemplateRef("qrcodeShare");
  const onOpenQrcode = () => {
    qrcodeShare.value?.open();
  };
</script>
<template>
  <v-card
    class="mt-4 invite-gradient"
    height="120"
    rounded="lg"
    elevation="4"
  >
    <div
      class="d-flex ga-2 align-center justify-space-between h-100 px-4 px-md-12"
    >
      <v-avatar
        size="70"
        class="elevation-2"
      >
        <v-img
          src="/users/reward.png"
          cover
        />
      </v-avatar>
      <div>
        <div class="text-h6 font-weight-bold text-white">
          成功邀请 {{ userInfo.invite_count || 0 }}人
        </div>
        <div class="text-body-2 text-white">永久解锁禁区观影权限</div>
      </div>

      <v-btn
        rounded="pill"
        variant="elevated"
        elevation="0"
        color="white "
        class="px-2 px-md-5 font-weight-bold"
        density="comfortable"
        @click="onOpenQrcode"
      >
        <span class="text-primary">立即邀请</span>
      </v-btn>
    </div>
  </v-card>
  <QrcodeShare ref="qrcodeShare"></QrcodeShare>
</template>

<style scoped lang="scss">
  .invite-gradient {
    background: linear-gradient(45deg, #fec1c1, #852309);
  }
</style>
