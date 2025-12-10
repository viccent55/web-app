<script setup lang="ts">
import MobileHeader from "./mobile/Header.vue";
import PcHeader from "./desktop/Header.vue";
import Footer from "./mobile/Footer.vue";

import type { NavigationItem } from "@/types/item";
import { NavigationItems } from "@/common";
import { checkPermissions } from "@/hooks/usePermisions";
import { PERMISSION } from "@/common/permision";
import useVaraible from "@/composables/useVariable";
import { screenMode } from "@/hooks/useScreenMode";

const { router, store, storeUser } = useVaraible();
const { configuration } = storeToRefs(store);

const clickNavigationItem = (item: NavigationItem) => {
  if (item.type === "router-link") {
    if (item.href !== "/user") {
      router.push(item.href);
    } else {
      checkPermissions(PERMISSION.User, () => {
        router.push({ path: `/user/${storeUser.useId}` });
      });
    }
  } else {
    // openPage(item.href);
  }
};

const indexChannel = ref<string>("001");
const categories = computed(() => [
  { name: "发现", value: "001" },
  ...(configuration.value.categories || []).map((item: EmptyObjectType) => ({
    name: item.name,
    value: item.id,
  })),
]);

// header offset for sticky elements (tweak values as needed)
const headerOffset = computed(() => {
  // adjust these if your headers are different heights
  return screenMode.value === "phone" ? "63px" : "64px";
});

// helper for route key so keep-alive splits by path, not query
const routeKey = (route: any) => (route.fullPath || "").split("?")[0];
</script>

<template>
  <!-- Header -->
  <MobileHeader v-if="screenMode === 'phone'" />
  <PcHeader v-else />

  <v-main class="bg-background">
    <v-container class="px-md-8 px-0 pt-0" :fluid="$vuetify.display.lgAndDown">
      <div class="layout-root">
        <!-- LEFT SIDEBAR (desktop only) -->
        <aside class="aside-column d-none d-md-block" :style="{ top: headerOffset }">
          <Aside :items="NavigationItems" @click-nav-item="clickNavigationItem" />
        </aside>
        <!-- RIGHT CONTENT -->
        <section class="content-column">
          <!-- Sticky channel bar -->
          <div v-if="configuration?.categories?.length > 0 && ['Home', 'Category'].includes($route?.name as string)"
            class="channel-bar-sticky bg-surface px-2 mb-2 " :style="{ top: headerOffset }">
            <ExploreChannelBar :items="categories" :active-value="indexChannel" />
          </div>

          <!-- Route content with keep-alive -->
          <router-view v-slot="{ Component, route }" class="px-md-0 ">
            <transition name="fade">
              <keep-alive>
                <component v-if="route.meta.isKeepAlive" :is="Component" :key="routeKey(route)" />
              </keep-alive>
            </transition>
            <component v-if="!route.meta.isKeepAlive" :is="Component" :key="routeKey(route)" />
          </router-view>
        </section>
      </div>
    </v-container>
  </v-main>

  <!-- Footer only on mobile -->
  <Footer v-if="screenMode === 'phone'" :items="NavigationItems" @click-nav-item="clickNavigationItem" />
</template>

<style scoped lang="scss">
.layout-root {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

/* LEFT SIDEBAR (desktop) */
.aside-column {
  position: sticky;
  /* top is bound in template via :style="{ top: headerOffset }" */
  align-self: flex-start;
  width: 300px;
  /* or whatever width you like */
}

/* RIGHT CONTENT */
.content-column {
  flex: 1;
  min-width: 0;
}

/* Sticky channel bar */
.channel-bar-sticky {
  position: sticky;
  /* top is bound in template via :style="{ top: headerOffset }" */
  z-index: 10;
  /* or use var(--v-theme-surface) */
  padding-top: 4px;
  padding-bottom: 4px;
}

/* Optional: spacing for the page content below the bar */
.content-column> :deep(.fade-enter-active),
.content-column> :deep(.fade-leave-active) {
  /* keep your transitions smooth inside */
}
</style>
