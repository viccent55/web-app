import { useGoTo } from "vuetify";
import { useStore } from "@/stores";
import { useUserStore } from "@/stores/user";
import dayjs from "dayjs";

const useVariable = () => {
  const store = useStore();
  const storeUser = useUserStore();
  const route = useRoute();
  const router = useRouter();
  const goto = useGoTo();
  const onCopy = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = Object.assign(document.createElement("textarea"), {
          value: text,
        });
        document.body.append(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      console.log("✅ Copied!");
    } catch (err) {
      console.error("❌ Copy failed:", err);
    }
  };

  const formatTime = (timestamp: string | number | Date) => {
    const createdAt =
      typeof timestamp === "number"
        ? new Date(timestamp * 1000) // seconds → ms
        : typeof timestamp === "string" && /^\d+$/.test(timestamp)
          ? new Date(parseInt(timestamp) * 1000)
          : new Date(timestamp);

    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} 分钟前 `;
    } else if (diffHours < 24) {
      return `${diffHours} 小时前 `;
    } else if (diffDays < 7) {
      return `${diffDays} 天前 `;
    } else {
      return createdAt.toLocaleDateString();
    }
  };
  const formatDate = (
    date: string | number | Date,
    format = "MM/DD/YYYY HH:mm"
  ) => {
    return dayjs(date).format(format);
  };

  const getDeviceInfo = () => {
    const ua = navigator.userAgent.toLowerCase();

    const isIos = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isMobile = isIos || isAndroid || /mobile/.test(ua);

    const isWindows = /windows nt/.test(ua);
    const isMac = /macintosh|mac os x/.test(ua) && !isIos;

    const isPc = !isMobile && (isWindows || isMac);

    let type:
      | "ios"
      | "android"
      | "windows"
      | "macos"
      | "pwa"
      | "other"
      | "unknown" = "unknown";

    if (isIos) type = "ios";
    else if (isAndroid) type = "android";
    else if (isWindows) type = "windows";
    else if (isMac) type = "macos";

    // Check if the app is running as a PWA
    const isPwa =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.startsWith("android-app://");

    return {
      isPc,
      isMobile,
      isIos,
      isAndroid,
      isWindows,
      isMac,
      type,
      isPwa,
    };
  };
  const getTypeDevice = () => {
    const device = getDeviceInfo();
    let type = 0;
    switch (true) {
      case device.isPc:
        type = 1; // PC
        break;
      case device.isPwa:
        type = 2; // PWA
        break;
      case device.isAndroid:
        type = 3; // ANDROID
        break;
      case device.isIos:
        type = 4; // IOS
        break;
      default:
        type = 6; // OTHER
    }
    return type;
  };
  const clearQuery = () => {
    const { origin, pathname, hash } = window.location;
    const newUrl = `${origin}${pathname}${hash}`;
    window.history.replaceState({}, "", newUrl);
  };
  const debounce = <T extends (...args: any[]) => void>(
    fn: T,
    delay: number
  ) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  };
  return {
    store,
    route,
    router,
    onCopy,
    formatTime,
    goto,
    getDeviceInfo,
    getTypeDevice,
    clearQuery,
    storeUser,
    debounce,
    formatDate,
  };
};
export default useVariable;
