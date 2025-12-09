import axios from "axios";
import { useDecryption } from "@/composables/useDecryption";
import { encrypt, makeSign } from "@/utils/crypto";
import dayjs from "dayjs";
import { useUserStore } from "@/stores/user";

const apiEndPoint = import.meta.env.VITE_PROD_API_BASE;

export async function gePostionAds(id: number): Promise<EmptyObjectType> {
  try {
    const { encryptData } = useDecryption();
    const res = await axios.get(`${apiEndPoint}/apiv1/advert/${id}`);
    if (res.data) {
      const decrypted = encryptData(res.data);
      res.data = decrypted;
    }
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getConfiguration(): Promise<EmptyObjectType> {
  try {
    const { encryptData } = useDecryption();
    const res = await axios.get(`${apiEndPoint}/apiv1/index/config`);
    if (res.data) {
      const decrypted = encryptData(res.data);
      res.data = decrypted;
    }
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
export async function getUserInfo(id: number): Promise<EmptyObjectType> {
  try {
    const { encryptData } = useDecryption();
    const res = await axios.get(`${apiEndPoint}/apiv1/index/userinfo-${id}`);
    if (res.data) {
      const decrypted = encryptData(res.data);
      res.data = decrypted;
    }
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getPageInfo(pageName: string): Promise<EmptyObjectType> {
  try {
    const { encryptData } = useDecryption();
    const res = await axios.get(`${apiEndPoint}/apiv1/article-${pageName}`);
    if (res.data) {
      const decrypted = encryptData(res.data);
      res.data = decrypted;
    }
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getNoteDetail(
  id: number,
  visitor: string
): Promise<EmptyObjectType> {
  try {
    const { encryptData } = useDecryption();
    const res = await axios.get(`${apiEndPoint}/apiv1/item/${id}/${visitor}`);
    if (res.data) {
      const decrypted = encryptData(res.data);
      res.data = decrypted;
    }
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getNoteFeeds(
  id: number,
  page: number
): Promise<EmptyObjectType> {
  try {
    const { encryptData } = useDecryption();
    const res = await axios.get(`${apiEndPoint}/apiv1/item/user-${id}/${page}`);
    if (res.data) {
      const decrypted = encryptData(res.data);
      res.data = decrypted;
    }
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getStatus(params: object): Promise<EmptyObjectType> {
  try {
    const { encryptData } = useDecryption();
    const res = await axios.post(
      `${apiEndPoint}/apiv1/member/follow/status`,
      params
    );
    if (res.data) {
      const decrypted = encryptData(res.data);
      res.data = decrypted;
    }
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function refreshToken(
  refresh_token: string
): Promise<EmptyObjectType> {
  try {
    const { encryptData } = useDecryption();
    const timestamp = dayjs().unix();
    const encryptedDataToken = encrypt({ refresh_token });
    const sign = makeSign(timestamp, encryptedDataToken);
    const request = {
      client: "pwa",
      timestamp,
      data: encryptedDataToken,
      sign,
    };
    const res = await axios.post(
      `${apiEndPoint}/apiv1/index/refreshToken`,
      {
        ...request,
      },
      {
        headers: {
          Authorization: `Bearer ${refresh_token}`,
        },
      }
    );
    if (res.data) {
      const decrypted = encryptData(res.data);
      res.data = decrypted;
    } else {
      return Promise.reject(res.data);
    }
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
