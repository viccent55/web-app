import { onUnmounted, watch } from "vue";

export function useDialogUXLock(dialogVisible: Ref<boolean>) {
  let lastScroll = 0;

  const lockBodyScroll = () => {
    lastScroll = window.scrollY;
    document.body.style.top = `-${lastScroll}px`;
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
  };

  const unlockBodyScroll = () => {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, lastScroll);
  };

  const preventHorizontalSwipe = (e: TouchEvent) => {
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - startX);
    const dy = Math.abs(touch.clientY - startY);
    // If horizontal swipe is stronger than vertical, prevent it
    if (dx > dy) e.preventDefault();
  };

  let startX = 0;
  let startY = 0;

  const touchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const handleBackButton = (e: PopStateEvent) => {
    // prevent browser from going back
    if (dialogVisible.value) {
      e.preventDefault();
      history.pushState(null, "", location.href);
    }
  };

  watch(dialogVisible, (visible) => {
    if (visible) {
      lockBodyScroll();
      window.addEventListener("touchstart", touchStart, { passive: false });
      window.addEventListener("touchmove", preventHorizontalSwipe, {
        passive: false,
      });
      window.addEventListener("popstate", handleBackButton);
      history.pushState(null, "", location.href); // Add dummy history state
    } else {
      unlockBodyScroll();
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", preventHorizontalSwipe);
      window.removeEventListener("popstate", handleBackButton);
    }
  });

  onUnmounted(() => unlockBodyScroll());
}
