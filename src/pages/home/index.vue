<script setup lang="ts">
import ExplorePageContent from "@/components/explore/PageContent.vue";

const pageContent = useTemplateRef('page-content')

onMounted(() => {
  pageContent.value?.initialize()
})
</script>

<template>
  <v-container class="pa-0" fluid>
    <h1 class="d-none">小红书成人版-记录性福每一天</h1>
    <v-card flat color="transparent" ref="">
      <ExplorePageContent ref="page-content" />
    </v-card>
  </v-container>
</template>

<style scoped lang="scss"></style>
