<script setup lang="ts">
  import { useUserStore } from "@/stores/user";
  import { openLoginDialog } from "@/hooks/useLoginDialog";
  import type { NavigationItem } from "@/types/item";
  import SocialNetwork from "@/components/desktop/SocialNetwork.vue";
  import AppLink from "@/components/AppLink.vue";
  import { useStore } from "@/stores";
  import { adsClick } from "@/service/advert";
  import { openPage } from "@/service";
  import { useDisplay } from "vuetify";
  const { lgAndDown } = useDisplay();
  const userStore = useUserStore();

  defineEmits(["click-menu-item", "click-nav-item"]);

  defineProps<{
    items: NavigationItem[];
    activeItem?: NavigationItem;
  }>();

  const store = useStore();

  const itemClick = (item: EmptyObjectType) => {
    adsClick(item.id);
  };

  const onOpenPage = () => {
    openPage(`${store.configuration?.download_app_url}?chan=${store.chan}`);
  };
</script>

<template>
  <div class="py-4 px-2 d-flex flex-column">
    <!-- Social Links -->
    <SocialNetwork class="mb-4" />

    <v-row dense>
      <v-col cols="12">
        <!-- 登录按钮 -->
        <v-btn
          v-if="!userStore.isLogin"
          color="error"
          size="large"
          rounded="pill"
          class="mb-2"
          block
          @click="openLoginDialog"
        >
          登录
        </v-btn>
      </v-col>
      <v-col cols="12">
        <!-- App 下载按钮 -->
        <v-btn
          color="warning"
          size="large"
          rounded="pill"
          block
          class="mb-6"
          @click="onOpenPage"
        >
          App下载
        </v-btn>
      </v-col>
    </v-row>

    <!-- 推荐广告 -->
    <AppLink
      v-if="store?.recommendAds?.length > 0"
      :apps="store?.recommendAds"
      @item-click="itemClick"
      class="mb-6"
      :height="lgAndDown ? '200px' : '350px'"
    />

    <!-- 登录后显示个人中心 -->
    <v-spacer />
    <v-btn
      v-if="userStore.isLogin"
      size="large"
      rounded="pill"
      variant="outlined"
      prepend-icon="mdi-account-circle"
      :to="`/user/${userStore.useId}`"
      class="text-primary transition-all border"
    >
      个人中心
    </v-btn>
  </div>
</template>

<style scoped lang="scss"></style>
