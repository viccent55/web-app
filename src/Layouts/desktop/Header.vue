<script setup lang="ts">
import { NavigationItems } from "@/common";
import { useTheme } from "vuetify/lib/composables/theme.mjs";
import { useStore } from "@/stores";
import { checkPermissions } from "@/hooks/usePermisions";
import { PERMISSION } from "@/common/permision";
import useVariable from "@/composables/useVariable";

const store = useStore();
const theme = useTheme();
const { router, storeUser } = useVariable();

const toggleDark = () => {
  store.setTheme(store.darkMode === "dark" ? "light" : "dark");
  theme.change(store.darkMode);
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
const dialgInfo = useTemplateRef("dialog-info");
const openLoginDialog = (item: Record<string, string>) => {
  dialgInfo.value?.open(item);
};
const searchDisabled = ref(false);
const onFocusSearch = () => {
  if (searchDisabled.value) return;
  checkPermissions(PERMISSION.User, () => { });
};

const clickNavigationItem = (item: any) => {
  if (item.href === "/user") {
    checkPermissions(PERMISSION.User, () => {
      router.push({ path: `/user/${storeUser.useId}` });
    });
    return;
  }
  router.push(item.href);
};
</script>
<template>
  <v-app-bar flat color="surface">
    <v-container class="my-0 py-0">
      <v-row dense>
        <v-col cols="12">
          <div class="d-flex align-center ga-5 w-100 justify-space-between">
            <v-btn variant="text" class="pa-0 text-body-1 font-weight-bold" rounded="xl" href="/">
              <v-img src="/logo.png" width="80" alt="Logo"></v-img>
            </v-btn>

            <!-- Navigation -->
            <nav aria-label=" navigation" class="d-flex ga-lg-8 ga-sm-3">
              <a v-for="(item, index) in NavigationItems" @click.prevent="clickNavigationItem(item)" :href="item.href"
                :class="[
                  'text-button',
                  { 'router-link-exact-active': $route.path === item.href },
                ]" :key="index">
                {{ item.name }}
              </a>
            </nav>
            <v-text-field v-model="store.search" hide-details density="compact" variant="outlined" placeholder="请输入搜索内容"
              append-inner-icon="mdi-magnify" rounded="xl" color="surface-variant" class="rounded-xl" max-width="400px"
              @focus="onFocusSearch" @keydown.enter="onFocusSearch" />
            <div class="d-flex align-center ga-2">
              <v-fab elevation="1" icon="mdi-brightness-6" color="surface" @click="toggleDark" />
              <div class="d-flex align-center text-caption">
                <div class="d-flex">
                  <v-btn v-for="(item, index) in menuItems" :key="index" @click="openLoginDialog(item)">
                    {{ item.name }}
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
  <DialogInfo ref="dialog-info" />
</template>

<style lang="scss" scoped>
.text-button {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  text-decoration: none;
  transition: color 0.2s ease-in-out;
  font-size: large !important;

  &:hover {
    color: rgb(var(--v-theme-primary));
  }
}

.router-link-exact-active {
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
}
</style>
