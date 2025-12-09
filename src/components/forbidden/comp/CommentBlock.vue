<script setup lang="ts">
  import Comment from "./Comment.vue";
  import { type ActionInfo } from "@/types/info";

  const emits = defineEmits([
    "expand-reply",
    "click-like",
    "click-author",
    "click-report",
    "click-replay",
  ]);

  const props = defineProps<{
    comment: EmptyObjectType;
  }>();

  const handle = {
    clickLike(item: ActionInfo, id: number) {
      emits("click-like", item, id);
    },
    clickAvatar(id: number) {
      emits("click-author", id);
    },
    clickReplay(id: number, name: string) {
      emits("click-replay", id, name);
    },
    clickReport(id: number) {
      emits("click-report", id);
    },
    expandReply() {
      emits("expand-reply", props.comment.id, props.comment.content);
    },
  };
</script>

<template>
  <div class="comment-block">
    <Comment
      :comment="comment"
      @click-avatar="handle.clickAvatar"
      @click-like="handle.clickLike"
      @click-reply="handle.clickReplay"
      @click-report="handle.clickReport"
    />
  
  </div>
</template>

<style scoped lang="scss">
  .comment-block {
    margin-bottom: 16px;

    & > :not(:first-child) {
      margin-left: 48px;
    }

    .expand {
      font-size: 14px;
      margin-left: 48px;
      cursor: pointer;
      color: rgb(19, 56, 108);
    }
  }
</style>
