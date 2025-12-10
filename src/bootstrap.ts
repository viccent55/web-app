import { ref } from "vue";

/**
 * Global runtime env injected from parent (iframe postMessage or native)
 */
export const injectedEnv = ref<{
  api?: string;
  platform?: string;
}>({
  api: undefined,
  platform: undefined,
});

/**
 * Initialize window message listener
 * This runs ONCE in main.ts
 */
export function initBootstrap() {
  if (typeof window === "undefined") return;

  // ✅ Already injected directly (same-origin or native)
  if ((window as any).__API_ENDPOINT__) {
    injectedEnv.value.api = (window as any).__API_ENDPOINT__;
  }

  if ((window as any).__PLATFORM__) {
    injectedEnv.value.platform = (window as any).__PLATFORM__;
  }

  // ✅ Listen for iframe postMessage injection
  window.addEventListener("message", (event) => {
    if (event.data?.type === "INIT_ENV") {
      injectedEnv.value.api = event.data.api;
      injectedEnv.value.platform = event.data.platform;

      // ✅ Also expose on window for legacy usage (axios etc.)
      (window as any).__API_ENDPOINT__ = event.data.api;
      (window as any).__PLATFORM__ = event.data.platform;

      console.log("✅ bootstrap injected:", injectedEnv.value);
    }
  });
}
