/**
 * 打开关闭笔记对话框的hook
 */

import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export const noteDialogVisible = ref(false);
const noteDialogId = ref<number | string>("-1");

export function useNoteForbidden() {
  const route = useRoute();
  const router = useRouter();

  function openNoteDialog(id: number) {
    noteDialogVisible.value = true;
    noteDialogId.value = id;

    router.push({
      ...route,
      query: {
        ...route.query,
        noteForbiddenId: id,
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
        noteForbiddenId: undefined,
      },
    });
  }

  // 传入route，从路由中获取id
  function queryNoteDialogId() {
    const noteForbiddenId = route.query.noteForbiddenId;

    if (noteForbiddenId) {
      openNoteDialog(Number(noteForbiddenId));
    }
  }

  return {
    id: noteDialogId,
    openNoteDialog,
    closeNoteDialog,
    queryNoteDialogId,
  };
}
