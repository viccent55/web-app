// useJWT.ts
/**
 * 使用localStorage存储JWT token，并在每次请求时附带上token。
 */

import axios from "axios";
import dayjs from "dayjs";
import { useUserStore } from "@/stores/user";
import { encrypt, decrypt, makeSign } from "@/utils/crypto";
import { injectedEnv } from "@/bootstrap";

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// 向请求头中添加token
async function appendToken(config: any) {
  const userStore = useUserStore();
  const token = userStore.token.access_token;
  const refresh = userStore.token.refresh_token;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    return;
  }

  // 没有 access_token，但有 refresh_token，可以尝试刷新
  if (refresh) {
    console.log("[JWT] no access_token, try refresh …");
    const ok = await refreshAccessToken();
    if (ok) {
      const newToken = useUserStore().token.access_token;
      if (newToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${newToken}`;
      }
    }
  }
}

// 将新的token写入localStorage
function writeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

// 存储 refresh_token（这里就是简单写入）
function writeRefreshToken(refresh_token: string) {
  localStorage.setItem(REFRESH_KEY, refresh_token);
}

// 移除token
function removeToken() {
  const userStore = useUserStore();
  userStore.token.access_token = "";
  userStore.token.refresh_token = "";
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/**
 * 真正调用后端刷新 access_token
 * 返回 true/false 表示是否刷新成功
 */
async function refreshAccessToken(): Promise<boolean> {
  const userStore = useUserStore();
  const refreshToken = userStore.token.refresh_token;

  if (!refreshToken) {
    console.warn("[JWT] no refresh_token, cannot refresh");
    removeToken();
    return false;
  }

  // 防止并发重复刷新
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const api =
    (window as any).__API_ENDPOINT__ ||
    injectedEnv.value.platform ||
    import.meta.env.VITE_PROD_API_BASE;

  const client = "pwa";
  const timestamp = dayjs().unix();
  const encryptedData = encrypt({}); // 如果后端需要其他参数，可以在这里传
  const sign = makeSign(timestamp, encryptedData);

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await axios.post(
        `${api}/apiv1/auth/refreshToken`,
        {
          client,
          timestamp,
          data: encryptedData,
          sign,
        },
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
          timeout: 10000,
        }
      );

      if (res.status !== 200 || !res.data) {
        throw new Error("refresh failed: bad response");
      }

      // 后端如果也是加密返回，则先解密
      let payload: any = res.data;
      if (payload?.data) {
        payload = decrypt(payload.data);
      }

      const { access_token, refresh_token } = payload || {};

      if (!access_token) {
        throw new Error("no access_token in refresh response");
      }

      userStore.token.access_token = access_token;
      userStore.token.refresh_token = refresh_token || refreshToken;

      writeToken(access_token);
      if (refresh_token) {
        writeRefreshToken(refresh_token);
      }

      console.log("[JWT] refresh success");
      return true;
    } catch (e) {
      console.error("[JWT] refreshAccessToken failed:", e);
      removeToken();
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export { appendToken, refreshAccessToken, writeToken, writeRefreshToken, removeToken };
