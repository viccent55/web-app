<script setup lang="ts">
  import Avatar from "@/components/Avatar.vue";

  defineProps<{
    comment: EmptyObjectType;
  }>();

  defineEmits([
    "click-like", // 点赞
    "click-avatar", // 点击头像
    "click-reply", // 点击回复
    "click-report", // 点击举报
  ]);
</script>

<template>
  <div class="comment">
    <div
      class="avatar"
      :class="{ 'with-reply': comment?.replyTo }"
    >
      <Avatar
        size="32"
        :src="comment?.avatar"
        :id="comment?.id"
        fit="cover"
        @click="$emit('click-avatar', comment?.id)"
      />
    </div>
    <div class="right">
      <!-- prettier-ignore -->
      <div class="author-wrapper">
        <span class="name">{{ comment?.author?.name }}</span>
        <span class="name" v-if="comment?.replyTo">></span>
        <span class="name" v-if="comment?.replyTo">{{ comment.replyTo }}</span>
        <!-- <ReportButton @click-report="$emit('click-report', comment?.id)" /> -->
      </div>
      <span class="content">{{ comment?.content }}</span>
      {{ comment?.date }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .comment {
    // width: 100%;
    display: flex;
    padding: 8px;
  }

  .right {
    margin-left: 8px;
    font-size: 14px;
    flex: 1;
    display: flex;
    flex-direction: column;

    .name {
      font-size: 14px;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .content {
      font-size: 14px;
      color: var(--text-color-dark);
    }

    > :not(:first-child) {
      margin-top: 2px;
    }
  }

  .avatar {
    display: flex;
    justify-content: center;
    cursor: pointer;

    img {
      border-radius: 50%;
      width: 38px;
      height: 38px;
      border: 1px solid var(--border-color);
    }
  }

  .with-reply {
    img {
      width: 24px;
      height: 24px;
    }
  }

  .author-wrapper {
    display: flex;

    span {
      margin-right: 8px;
    }

    > :last-child {
      margin-left: auto;
    }
  }
</style>
