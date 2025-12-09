<script lang="ts" setup>
import useVariable from '@/composables/useVariable';

const { store } = useVariable();
</script>

<template>
  <v-card flat>
    <v-list class="pa-0" density="compact">
      <v-list-item class="rounded-sm" bg-color="blue-lighten-5">
        <h4 class="text-center pb-2 text-surface-variant">
          {{ store.configuration?.name || "最新地址" }}
        </h4>
        <v-list-item-title class="text-caption">
          最新地址：

          <a :href="store.configuration?.home_url" target="_blank"
            class="text-primary text-caption font-weight-medium text-pre-wrap">
            {{ store.configuration?.home_url }}
          </a>
        </v-list-item-title>
      </v-list-item>

      <v-list-item class="rounded-sm" bg-color="blue-lighten-5">
        <v-list-item-title class="text-caption">
          备用地址：
          <a :href="store.configuration?.domain_next" target="_blank"
            class="text-primary text-caption font-weight-medium text-pre-wrap">
            {{ store.configuration?.domain_next }}
          </a>
        </v-list-item-title>
      </v-list-item>

      <v-list-item class="rounded-sm" color="primary">
        <v-list-item-title class="text-caption">
          永久域名：
          <a :href="store.configuration?.domain_latest" target="_blank"
            class="text-primary text-caption font-weight-medium text-pre-wrap">
            {{ store.configuration?.domain_latest }}
          </a>
        </v-list-item-title>
      </v-list-item>
      <v-list-item class="rounded-sm" color="primary">
        <v-list-item-title class="text-caption">
          防失联邮箱：
          <a :href="'mailto:' + store.configuration?.email" target="_blank"
            class="text-primary text-caption font-weight-medium text-pre-wrap">
            {{ store.configuration?.email }}
          </a>
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>
