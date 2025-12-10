import axios, { type AxiosInstance } from "axios";
import { appendToken } from "@/hooks/useJWT";
import { encrypt, decrypt, makeSign } from "@/utils/crypto";
import dayjs from "dayjs";
import qs from "qs";
import { Session } from "@/utils/storage";
import { Notify } from "@/stores/notification";
import router from "@/router";
import { injectedEnv } from "@/bootstrap";

const service: AxiosInstance = axios.create({
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  paramsSerializer: {
    serialize(params) {
      return qs.stringify(params, { allowDots: true });
    },
  },
});

// Adding a request interceptor
service.interceptors.request.use(
  (config) => {
    // const store = useStore();
    const api = window.__API_ENDPOINT__ || injectedEnv.value.platform;
    if (api) {
      config.baseURL = `${api}/apiv1`;
    }

    appendToken(config);
    const client = "pwa";
    const timestamp = dayjs().unix();
    if (import.meta.env.MODE === "development") {
      console.log(`Request: `, config.data);
    }
    if (config.data) {
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

service.interceptors.response.use(
  (response) => {
    if (response.data.errcode === 401001) {
      const userStore = useUserStore();
      userStore.logout();
      Notify.error(response.data.info);
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
    // const res = response.data;
    // if (res.code && res.code !== 0) {
    //   // `token` Expired or the account has been logged in elsewhere
    //   if (res.code === 401) {
    //     Session.clear(); // Clear all temporary browser caches
    //     window.location.reload();
    //     Notify.error("登录状态已过期，请重新登录");
    //   }
    //   return res;
    // } else {
    //   return res;
    // }
  },
  (error) => {
    // Do something with the response error
    const currentRoute = router.currentRoute.value;
    const status = error.response?.status;
    const isNetworkError =
      error.message === "Network Error" ||
      error.code === "ECONNABORTED" ||
      !error.response; // no response = CORS/fetch failed/host down

    // 1) Handle auth error (401) separately
    if (status === 401) {
      Session.clear();
      Notify.error("登录状态已过期，请重新登录");
      // optionally redirect to login instead of reload:
      // router.push({ name: "Login" });
      window.location.reload();
      return Promise.reject(error);
    }

    // 2) For network / CORS / unreachable host, show toast + redirect
    if (isNetworkError) {
      Notify.error("服务器连接失败，请稍后重试");
      if (currentRoute.name !== "notFound") {
        router.push({
          name: "notFound",
          query: { from: currentRoute.fullPath },
        });
      }

      return Promise.reject(error);
    }
    // 4) Other errors: keep your previous behavior
    if (error.response?.data) {
      Notify.info(error.response.statusText || "请求出错");
    } else {
      Notify.error("接口路径找不到");
    }

    return Promise.reject(error);
  }
);

export default service;
