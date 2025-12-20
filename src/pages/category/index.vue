<script lang="ts" setup>
import ExplorePageContent from "@/components/explore/PageContent.vue";

defineOptions({
  name: "Category",
});

const pageContent = useTemplateRef("page-content");
const onRefresh = () => {
  pageContent.value?.resetAndFetch();
};
onMounted(() => {
  pageContent.value?.initialize()
});

</script>

<template>
  <v-container class="py-0" fluid>
    <h1 class="d-none">小红书成人版-记录性福每一天</h1>
    <v-card flat color="transparent">
      <ExplorePageContent ref="page-content" />
    </v-card>
    <v-fab class="fab" po icon="mdi-refresh" color="primary" size="small" @click="onRefresh" />
  </v-container>
</template>
<style scoped lang="scss"></style>
