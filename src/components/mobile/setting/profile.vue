<script lang="ts" setup>
  definePageMeta({
    keepalive: true,
  });

  const state = reactive({
    setting: [
      {
        title: "头像",
        value: "",
      },
    ],
  });
</script>

<template>
  <v-container
    class="pa-0"
    fluid
  >
    <!-- Title -->
    <v-app-bar
      flat
      color="white"
    >
      <v-toolbar-title class="text-h6 text-center w-100">
        账号设置
      </v-toolbar-title>
    </v-app-bar>

    <!-- List -->
    <v-list
      lines="one"
      density="comfortable"
    >
      <!-- 头像 -->
      <v-list-item>
        <v-list-item-title>头像</v-list-item-title>
        <template #append>
          <v-avatar size="40">
            <img
              src=""
              alt="avatar"
            />
          </v-avatar>
        </template>
      </v-list-item>

      <v-divider />

      <!-- 昵称 -->
      <v-list-item>
        <v-list-item-title>昵称</v-list-item-title>
        <template #append>
          <span class="text-grey">昵称</span>
          <v-icon
            icon="mdi-chevron-right"
            class="ml-2"
          />
        </template>
      </v-list-item>

      <v-divider />

      <!-- 个性签名 -->
      <v-list-item>
        <v-list-item-title>个性签名</v-list-item-title>
        <template #append>
          <span class="text-grey">世界这么大我想去看看</span>
          <v-icon
            icon="mdi-chevron-right"
            class="ml-2"
          />
        </template>
      </v-list-item>

      <v-divider />

      <!-- 手机号 -->
      <v-list-item>
        <v-list-item-title>手机号</v-list-item-title>
        <template #append>
          <span class="text-grey">123******19</span>
          <v-icon
            icon="mdi-chevron-right"
            class="ml-2"
          />
        </template>
      </v-list-item>

      <v-divider />

      <!-- 邮箱 -->
      <v-list-item>
        <v-list-item-title>邮箱</v-list-item-title>
        <template #append>
          <span class="text-grey">80******97@qq.com</span>
          <v-icon
            icon="mdi-chevron-right"
            class="ml-2"
          />
        </template>
      </v-list-item>

      <v-divider />

      <!-- 微信 -->
      <v-list-item>
        <v-list-item-title>微信</v-list-item-title>
        <template #append>
          <span class="text-grey">去绑定</span>
          <v-icon
            icon="mdi-chevron-right"
            class="ml-2"
          />
        </template>
      </v-list-item>
    </v-list>

    <v-divider class="my-2" />

    <!-- 修改密码 -->
    <v-list>
      <v-list-item>
        <v-list-item-title>修改密码</v-list-item-title>
        <template #append>
          <v-icon icon="mdi-chevron-right" />
        </template>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<style scoped>
  .text-grey {
    color: #999;
  }
  .w-100 {
    width: 100%;
  }
</style>
