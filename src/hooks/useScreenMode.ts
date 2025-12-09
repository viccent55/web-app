/**
 * @description: 根据屏幕宽度将屏幕分为三种模式：pc、pad、phone
 * @function listenResizeEvent 在App.vue中调用，监听屏幕大小变化，并更新screenMode
 * @var screenMode 屏幕模式，pc、pad、phone
 */

// 获取设备宽度以获得模式
import { ref, onMounted, onUnmounted } from 'vue'

// 屏幕模式
const screenMode = ref<'pc' | 'phone' | 'pad'>()

// 监听屏幕大小变化
function handleResize() {
  const width = window.innerWidth

  if (width >= 960) {
    screenMode.value = 'pc'
  } else if (width < 960 && width >= 695) {
    screenMode.value = 'pad'
  } else {
    screenMode.value = 'phone'
  }
}

// 挂载到组件上
function listenResizeEvent() {
  handleResize()

  onMounted(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
}

export { screenMode, listenResizeEvent }
