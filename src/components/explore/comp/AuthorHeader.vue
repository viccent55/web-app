<script setup lang="ts">
  import Avatar from "@/components/Avatar.vue";
  import { type UserInfo } from "@/types/info";

  const props = withDefaults(
    defineProps<{
      author: UserInfo;
      loading?: boolean;
    }>(),
    {
      loading: false, // ✅ default value
    }
  );

  const emits = defineEmits(["click-close", "click-author", "click-follow"]);

  const clickFollow = () => {
    emits("click-follow", props.author.id);
  };
</script>

<template>
  <div class="author-header rounded-r-2xl">
    <a
      :href="'/user/' + author?.id"
      class="text-grey-darken-1 text-decoration-none"
    >
      <Avatar :src="props.author?.avatar" />
      <span class="ml-2 text-body-2">{{ props.author?.nickname }}</span>
    </a>

    <FollowButton
      :loading="props.loading"
      :is-follow="author?.isFollow"
      @click="clickFollow"
    />
  </div>
</template>

<style scoped lang="scss">
  .author-header {
    position: sticky;
    top: 0;
    z-index: 16;
    width: 100%;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    background-color: var(--background-color);

    a {
      display: flex;
      align-items: center;
    }

    img {
      width: 40px;
      height: 40px;
      border: 1px solid var(--border-color);
      border-radius: 50%;
    }
  }

  // 关闭按钮
  .close-btn {
    position: absolute;
    right: 12px;
    top: 12px;
  }
</style>
