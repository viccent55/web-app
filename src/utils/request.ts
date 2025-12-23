// request.ts
import axios, { type AxiosInstance } from "axios";
import dayjs from "dayjs";
import qs from "qs";
import { Session } from "@/utils/storage";
import { Notify } from "@/stores/notification";
import router from "@/router";
import { appendToken, refreshAccessToken, removeToken } from "@/hooks/useJWT";
import { encrypt, decrypt, makeSign } from "@/utils/crypto";
import { useUserStore } from "@/stores/user";

//testing api
const test_env = true;

const service: AxiosInstance = axios.create({
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  paramsSerializer: {
    serialize(params) {
      return qs.stringify(params, { allowDots: true });
    },
  },
});

// 🔐 Request interceptor
service.interceptors.request.use(
  async (config: any) => {
    const api =
      (window as any).__API_ENDPOINT__ || test_env
        ? import.meta.env.VITE_MEMBER_API_BASE
        : import.meta.env.VITE_PROD_API_BASE;
    if (api) {
      config.baseURL = `${api}/apiv1`;
    }

    // 先附加 token（内部如果没有 token 会尝试 refresh）
    await appendToken(config);

    const client = "pwa";
    const timestamp = dayjs().unix();

    if (import.meta.env.MODE === "development") {
      console.log("Request:", config.url, config.data);
    }
    if (test_env) {
      return config;
    }
    // 避免在重试时二次加密：只有还没加密过的才加密
    if (config.data && !config._isEncrypted) {
      config._isEncrypted = true; // 自定义标记，防止二次加密

      const encryptedData = encrypt(config.data);
      const sign = makeSign(timestamp, encryptedData);

      config.data = {
        client,
        timestamp,
        data: encryptedData,
        sign,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor
service.interceptors.response.use(
  (response) => {
    if (response.data.errcode === 401001) {
      // 这里通常是 refresh 也失效之类，可以继续保持为强制退出
      const userStore = useUserStore();
      userStore.logout();
      Notify.error(response.data.info);
    }
    if (test_env) {
      return response.data;
    }
    if (response.status === 200) {
      // decrypt only if response contains "data"
      if (response.data?.data) {
        try {
          const decrypted = decrypt(response.data.data);
          response.data = decrypted;
          if (import.meta.env.MODE === "development") {
            console.log(`Decrypted: ${response.config.url}`, decrypted);
          }
        } catch (e) {
          console.warn("Decryption failed:", e, response.data);
        }
      }
      return response.data;
    }
  },
  async (error) => {
    const currentRoute = router.currentRoute.value;
    const status = error.response?.status;
    const isNetworkError =
      error.message === "Network Error" ||
      error.code === "ECONNABORTED" ||
      !error.response; // no response = CORS/fetch failed/host down

    const originalConfig: any = error.config || {};

    // 1) 处理 401：尝试刷新 token 然后重试一次
    if ((status === 401 && !originalConfig._retry) || status == 401013) {
      originalConfig._retry = true;
      const ok = await refreshAccessToken();

      if (ok) {
        const userStore = useUserStore();
        const newToken = userStore.token.access_token;

        if (newToken) {
          originalConfig.headers = originalConfig.headers || {};
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
        }

        // ⚠️ 注意：config.data 已经是加密后的结构，并且我们在 request 拦截器中用 _isEncrypted
        // 标记，重试时不会再次加密
        return service(originalConfig);
      }

      // refresh 失败 => 清除 Session，强制重新登录
      Session.clear();
      removeToken();
      Notify.error("登录状态已过期，请重新登录");
      window.location.reload();
      return Promise.reject(error);
    }

    // 2) 网络 / 主机不可达错误（如果你想重定向到404可以打开注释）
    // if (isNetworkError) {
    //   Notify.error("服务器连接失败，请稍后重试");
    //   if (currentRoute.name !== "notFound") {
    //     router.push({
    //       name: "notFound",
    //       query: { from: currentRoute.fullPath },
    //     });
    //   }
    //   return Promise.reject(error);
    // }

    // 3) 其他错误：保持你原来的行为
    if (error.response?.data) {
      Notify.info(error.response.statusText || "请求出错");
    } else {
      Notify.error("接口路径找不到");
    }

    return Promise.reject(error);
  }
);

export default service;
