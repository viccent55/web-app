<script lang="ts" setup>
import { checkPermissions } from "@/hooks/usePermisions";
import { PERMISSION } from "@/common/permision";
import { useTheme } from "vuetify";
import { openPage } from "@/service";
import { adsClick } from "@/service/advert";
import useVariable from "@/composables/useVariable";

const theme = useTheme();
const { store, route, router } = useVariable();

const searchDisabled = ref(false);
const onFocusSearch = () => {
  if (searchDisabled.value) return;
  console.log(PERMISSION.User)
  checkPermissions(PERMISSION.User, () => { });
};
const toggleDark = () => {
  store.setTheme(store.darkMode === "dark" ? "light" : "dark");
  theme.change(store.darkMode);
};
const categories = computed(() => {
  const list = store.configuration?.categories ?? []

  return [
    { name: "发现", value: "001" },
    ...list.map((item: EmptyObjectType) => ({
      name: item.name,
      value: item.id,
    })),
  ]
})


const clickMenuItem = (item: Record<string, string>) => {
  router.push(`/category/${item.value}`)
};

const onOpenPage = () => {
  const param = route.query.chan || "";
  const urlParams = new URLSearchParams(window.location.search);
  const chan = urlParams.get("chan"); // "cgtt"
  openPage(`${store.configuration?.download_app_url}?chan=${chan || param}`);
};
const menuItems = computed(() => {
  const links = store.configuration?.header_menu_link || ""; // fallback empty string
  return links
    .split("\n")
    .filter((line: string) => line.includes("|")) // avoid bad lines
    .map((line: string) => {
      const [name, page] = line.split("|");
      return { name: name.trim(), page: page.trim() };
    });
});
const dialogVisible = ref(false);
const openAds = () => {
  dialogVisible.value = true;
};
const dialgInfo = ref();
const openLoginDialog = (item: Record<string, string>) => {
  dialgInfo.value.open(item);
};
const homePage = () => {
  window.location.href = "/";
  ;
};
</script>
<template>
  <div class="d-flex align-center ga-2 w-100 justify-space-between px-3">
    <v-btn variant="text" class="pa-0 text-body-1 font-weight-bold" @click="homePage" rounded="xl">
      <v-img src="/logo.png" width="80" alt="Logo"></v-img>
    </v-btn>
    <v-text-field v-model="store.search" hide-details density="compact" variant="outlined" placeholder="请输入搜索内容"
      append-inner-icon="mdi-magnify" rounded="xl" color="warning" max-width="400px" @focus="onFocusSearch"
      @keydown.enter="onFocusSearch" />
    <div class="d-flex align-center ga-2">
      <v-fab elevation="1" icon="mdi-weather-night" color="surface" density="comfortable" @click="toggleDark" />
      <v-menu location="bottom" transition="fade-transition" min-width="auto">
        <!-- Activator Button -->
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" icon class="more-btn" density="comfortable">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <!-- Dropdown Content -->
        <v-list class="custom-dropdown" density="comfortable">
          <!-- Categories -->
          <v-list-item v-for="(item, index) in categories" :key="index" @click="clickMenuItem(item)">
            <v-list-item-title class="px-3 py-1 text-base">
              {{ item.name }}
            </v-list-item-title>
          </v-list-item>

          <v-divider class="my-1 border-opacity-50" />

          <!-- Install to Desktop (iOS/Android/Desktop) -->
          <!-- <v-list-item>
                      <v-list-item-title>
                        <div
                          v-if="isIOS"
                          class="text-base px-3 py-1 cursor-pointer"
                          @click="dialogIosGuide.openDialog()"
                        >
                          安装到桌面
                          <v-icon
                            slot="prepend"
                            class="ms-2"
                          >
                            mdi-download
                          </v-icon>
                        </div>

                        <div
                          v-else
                          class="px-3 py-1 cursor-pointer"
                          @click="promptInstall"
                        >
                          安装到桌面
                          <v-icon
                            slot="prepend"
                            class="ms-2"
                          >
                            mdi-download
                          </v-icon>
                        </div>
                      </v-list-item-title>
                    </v-list-item> -->

          <!-- Download App -->
          <v-list-item @click="onOpenPage">
            <v-list-item-title class="text-base px-3 py-1">
              下载app
            </v-list-item-title>
          </v-list-item>

          <v-divider class="my-1 border-opacity-50" />

          <!-- Menu items + Ads -->
          <v-list-item v-for="(item, index) in [
            ...menuItems,
            { name: '福利应用', page: 'ads' },
          ]" :key="index" @click="item.page === 'ads' ? openAds() : openLoginDialog(item)">
            <v-list-item-title class="text-base px-3 py-1">
              {{ item.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
  <v-dialog v-model="dialogVisible" max-width="320">
    <v-card>
      <!-- Header -->
      <v-card-title class="justify-center text-center">
        推荐福利应用
      </v-card-title>

      <!-- Content -->
      <v-card-text>
        <AppLink class="mt-2" :apps="store?.recommendAds" v-if="store?.recommendAds?.length > 0"
          @item-click="(v: EmptyObjectType) => adsClick(v.id)" height="100%" />
      </v-card-text>

      <!-- Optional Close Actions -->
      <!--
      <v-card-actions class="justify-end">
        <v-btn text @click="handleClose">关闭</v-btn>
      </v-card-actions>
      --></v-card>
  </v-dialog>
  <DialogInfo ref="dialgInfo" />
</template>
