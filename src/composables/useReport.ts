import { ref } from "vue";
import { setConfig } from "@/utils/statistics";
import { getInstallCode, getParamCode, getParamE } from "@/service";

export function useReport() {
  const isRunning = ref(false);
  const store = useStore();

  const KEY = "last_report_alive";
  const shouldRunToday = () => {
    const last = localStorage.getItem(KEY);
    if (!last) return true;

    const lastDate = new Date(last);
    const now = new Date();

    // Compare YYYY-MM-DD only
    return (
      lastDate.getFullYear() !== now.getFullYear() ||
      lastDate.getMonth() !== now.getMonth() ||
      lastDate.getDate() !== now.getDate()
    );
  };

  const runOncePerDay = async () => {
    if (isRunning.value) return; // prevent double-run
    if (!shouldRunToday()) return; // already ran today

    isRunning.value = true;
    try {
      await setConfig({
        appId: "1234567898765432100",
        productId: "xhslandpage",
        backendURL: import.meta.env.VITE_TRANSACTION_API_BASE,
        promoCode: getParamCode(),
        productCode: getParamE(),
        actionType: "active",
      });

      // Save today's date
      localStorage.setItem(KEY, new Date().toISOString());
    } catch (e) {
      console.error("setConfig failed:", e);
    } finally {
      isRunning.value = false;
    }
  };

  const getFirstVisitInApp = async () => {
    if (store.isInstalled) return;
    try {
      await setConfig({
        appId: "1234567898765432100",
        productId: "xhslandpage",
        backendURL: import.meta.env.VITE_TRANSACTION_API_BASE,
        promoCode: getParamCode(),
        productCode: getParamE(),
        actionType: "install",
        installCode: getInstallCode(),
      });
      store.isInstalled = true;
    } catch (e) {
      console.log(e);
    }
  };
  function isIOS(): boolean {
    if (typeof window === "undefined") return false;

    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      // iPadOS 13+ reports as Mac, but with touch
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  }
  const onReportIos = async () => {
    const request = {
      appId: "1234567898765432100",
      productId: "xhslandpage",
      backendURL: import.meta.env.VITE_TRANSACTION_API_BASE,
      promoCode: getParamCode(),
      productCode: getParamE(),
      actionType: "iosinit",
      installCode: getInstallCode(),
    };
    if (getInstallCode() && isIOS()) {
      console.warn("request =>", request);
      await setConfig(request);
    }
  };
  return { runOncePerDay, getFirstVisitInApp, onReportIos };
}
