<script setup lang="ts">
  import { computed } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import useVariable from "@/composables/useVariable";
  import { NavigationItems } from "@/common";
  import { checkPermissions } from "@/hooks/usePermisions";
  import { PERMISSION } from "@/common/permision";

  const { storeUser } = useVariable();
  const route = useRoute();
  const router = useRouter();

  const active = computed({
    get: () => route.name as string | undefined,
    set: (val) => {
      if (!val) return;
      const item = NavigationItems.find((i: any) => i.routeName === val);
      if (!item) return;
      handleClick(item);
    },
  });

  const handleClick = (item: any) => {
    if (item.href === "/user") {
      checkPermissions(PERMISSION.User, () => {
        router.push({ path: `/user/${storeUser.useId}` });
      });
    } else {
      // Prefer named routes if you have them
      if (item.routeName) {
        router.push({ name: item.routeName });
      } else {
        router.push(item.href);
      }
    }
  };
</script>
<template>
  <v-bottom-navigation
    v-model="active"
    app
    height="auto"
    class="footer bg-surface app-footer"
    density="comfortable"
  >
    <template
      v-for="item in NavigationItems"
      :key="item.routeName"
    >
      <v-btn
        class="channel-wrapper py-2"
        variant="text"
        style="min-width: 0; padding: 0"
        :value="item.routeName"
        @click="handleClick(item)"
      >
        <v-icon
          :icon="`mdi-${item.icon.toLowerCase()}`"
          size="24"
        />
        <span class="text-sm mt-1">
          {{ item.name }}
        </span>
      </v-btn>
    </template>
  </v-bottom-navigation>
</template>
<style scoped lang="scss">
  .app-footer {
    position: fixed;
    left: 0;
    right: 0;
    z-index: 10;
  }

  .footer {
    z-index: 16;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
  }

  .channel-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  /* Vuetify will add .v-btn--active based on v-model */
  :deep(.v-btn--active) {
    color: rgb(var(--v-theme-primary)) !important;
    font-weight: 600;
  }
</style>
