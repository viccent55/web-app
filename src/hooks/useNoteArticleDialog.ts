/**
 * 打开关闭笔记对话框的hook
 */

import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export const noteDialogVisible = ref(false);
const noteDialogId = ref<number | string>("-1");

export function useNoteArticleDialog() {
  const route = useRoute();
  const router = useRouter();

  function openNoteDialog(id: number) {
    // const route = useRoute()
    // const router = useRouter()
    noteDialogVisible.value = true;
    noteDialogId.value = id;

    router.push({
      ...route,
      query: {
        ...route.query,
        noteArticleId: id,
      },
    });
  }

  function closeNoteDialog() {
    // const route = useRoute()
    // const router = useRouter()
    noteDialogVisible.value = false;
    noteDialogId.value = "-1";

    router.push({
      ...route,
      query: {
        ...route.query,
        noteArticleId: undefined,
      },
    });
  }

  // 传入route，从路由中获取id
  function queryNoteDialogId() {
    const noteArticleId = route.query.noteArticleId;

    if (noteArticleId) {
      openNoteDialog(Number(noteArticleId));
    }
  }

  return {
    id: noteDialogId,
    openNoteDialog,
    closeNoteDialog,
    queryNoteDialogId,
  };
}
