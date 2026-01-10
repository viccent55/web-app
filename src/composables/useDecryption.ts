import { ref } from "vue";
import CryptoJS from "crypto-js";
import { decrypt } from "@/utils/crypto";

const encryptionKey = CryptoJS.enc.Utf8.parse(
  "k9:3zeFq~]-EQMF,gpGx*uRw+x,n]xw9"
);
const iv = CryptoJS.enc.Utf8.parse("Zd3!t#t1YN=!fs)D");

const urlCache = new Map<string, string>();
const DEFAULT_IMAGE_HOST = import.meta.env.VITE_IMAGE_XHS;

export const useDecryption = () => {
  const decryptedImage = ref<string>("");
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /* -------------------------------
   * 🔓 decrypt image
   * ------------------------------ */
  const decryptAndCreateUrl = async (fullUrl: string): Promise<string> => {
    if (urlCache.has(fullUrl)) {
      return urlCache.get(fullUrl)!;
    }

    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Image fetch failed: ${response.status}`);
    }

    const encryptedData = await response.arrayBuffer();
    const encryptedBytes = new Uint8Array(encryptedData);
    const cipherText = CryptoJS.lib.WordArray.create(encryptedBytes as any);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: cipherText } as any,
      encryptionKey,
      {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const decryptedData = new Uint8Array(
      decrypted.words.flatMap((word) => [
        (word >> 24) & 0xff,
        (word >> 16) & 0xff,
        (word >> 8) & 0xff,
        word & 0xff,
      ])
    ).slice(0, decrypted.sigBytes);

    const blob = new Blob([decryptedData], { type: "image/jpeg" });
    const blobUrl = URL.createObjectURL(blob);

    urlCache.set(fullUrl, blobUrl);
    return blobUrl;
  };

  const clearCache = () => {
    for (const blobUrl of urlCache.values()) {
      URL.revokeObjectURL(blobUrl);
    }
    urlCache.clear();
  };

  /* -------------------------------
   * 🌐 image host probing (non-blocking)
   * ------------------------------ */
  let cachedImageHost = DEFAULT_IMAGE_HOST;

  const probeImageHostsInBackground = () => {
    const hosts = [
      import.meta.env.VITE_IMAGE_XHS,
      import.meta.env.VITE_IMAGE_CGXC1,
    ].filter(Boolean);

    Promise.allSettled(
      hosts.map(async (host) => {
        const start = performance.now();
        await fetch(host, { method: "HEAD", cache: "no-store" });
        return { host, time: performance.now() - start };
      })
    ).then((results) => {
      const fastest = results
        .filter(
          (r): r is PromiseFulfilledResult<any> => r.status === "fulfilled"
        )
        .map((r) => r.value)
        .sort((a, b) => a.time - b.time)[0];

      if (fastest) {
        cachedImageHost = fastest.host;
      }
    });
  };

  // 🔥 START probing immediately (do NOT await)
  // probeImageHostsInBackground();

  /* -------------------------------
   * 🖼 public API
   * ------------------------------ */
  const decryptImage = async (imagePath: string) => {
    decryptedImage.value = "";
    error.value = null;
    isLoading.value = true;

    try {
      const fullUrl = `${cachedImageHost}${imagePath}`;
      decryptedImage.value = await decryptAndCreateUrl(fullUrl);
      return decryptedImage.value;
    } catch (e: any) {
      error.value = e?.message || "Image decrypt failed";
    } finally {
      isLoading.value = false;
    }
  };

  const encryptData = (res: Record<string, any>) => {
    res.data = decrypt(res.data);
    return res.data;
  };

  const blobUrlToBase64 = (blobUrl: string): Promise<string> =>
    fetch(blobUrl)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );

  return {
    decryptedImage,
    isLoading,
    error,
    decryptImage,
    clearCache,
    encryptData,
    blobUrlToBase64,
  };
};
