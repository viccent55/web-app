/**
 * 打开关闭笔记对话框的hook
 */

import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export const noteDialogVisible = ref(false);
const noteDialogId = ref<string | number>("-1");

export function useNoteDialog() {
  const route = useRoute();
  const router = useRouter();

  function openNoteDialog(id: number) {

    noteDialogVisible.value = true;
    noteDialogId.value = id;

    router.push({
      ...route,
      query: {
        ...route.query,
        noteId: id,
      },
    });
  }

  function closeNoteDialog() {
    noteDialogVisible.value = false;
    noteDialogId.value = -1;

    router.push({
      ...route,
      query: {
        ...route.query,
        noteId: undefined,
      },
    });
  }

  // 传入route，从路由中获取id
  function queryNoteDialogId() {
    const noteId = Number(route.query.noteId);

    if (noteId) {
      openNoteDialog(noteId);
    }
  }

  return {
    id: noteDialogId,
    openNoteDialog,
    closeNoteDialog,
    queryNoteDialogId,
  };
}
