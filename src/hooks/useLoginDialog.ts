/**
 * 打开关闭登录对话框的hook
 */

import { ref } from 'vue'

const loginDialogVisible = ref(false)

function openLoginDialog() {
  loginDialogVisible.value = true
}

function closeLoginDialog() {
  loginDialogVisible.value = false
}

export { loginDialogVisible, openLoginDialog, closeLoginDialog }
