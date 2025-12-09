<script setup lang="ts">
import Search from "@/components/mobile/Search.vue";
import DialogInfo from "@/components/DialogInfo.vue";
// import GuideIos from "@/components/GuideIos.vue";
import PopupSearch from "@/components/mobile/PopupSearch.vue";


</script>
<template>
  <v-app-bar flat app color="primary">
    <!-- Left: Logo -->
    <Search />
  </v-app-bar>
  <DialogInfo ref="dialgInfo" />
  <!-- <GuideIos ref="dialogIosGuide" /> -->
  <PopupSearch />
</template>

<style lang="scss" scoped>
.custom-dropdown {
  width: 160px;
}
</style>
