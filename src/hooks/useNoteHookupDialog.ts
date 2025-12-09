/**
 * 打开关闭笔记对话框的hook
 */

import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export const noteDialogVisible = ref(false);
const noteDialogId = ref<string | number>("-1");

export function useNoteHookupDialog() {
  const route = useRoute();
  const router = useRouter();

  function openNoteDialog(id: number) {
    noteDialogVisible.value = true;
    noteDialogId.value = id;

    router.push({
      ...route,
      query: {
        ...route.query,
        noteHookupId: id,
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
        noteHookupId: undefined,
      },
    });
  }

  // 传入route，从路由中获取id
  function queryNoteDialogId() {
    const noteHookupId = Number(route.query.noteHookupId);

    if (noteHookupId) {
      openNoteDialog(noteHookupId);
    }
  }

  return {
    id: noteDialogId,
    openNoteDialog,
    closeNoteDialog,
    queryNoteDialogId,
  };
}
