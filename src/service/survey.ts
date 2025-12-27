import service from "@/utils/request";
import axios from "axios";

export async function survey(params: object) {
  return await service.post("/feedback/submit", params);
}

export async function upload(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  // debug (safe)
  for (const [k, v] of formData.entries()) {
    console.log("FormData:", k, v);
  }

  const res = await axios.post(
    `${import.meta.env.VITE_PROD_API_BASE}/apiv1/upload/image`,
    formData
  );

  /**
   * {
   *   errcode: 0,
   *   info: "上传成功",
   *   data: { url: "https://up.chigua1.me/image/..." }
   * }
   */
  const json = res.data;

  if (json?.errcode !== 0) {
    throw new Error(json?.info || "Upload error");
  }

  return normalizeImageUrl(json.data.url);
}
function normalizeImageUrl(url: string): string {
  // Already relative
  if (url.startsWith("/")) {
    return url;
  }

  try {
    const u = new URL(url);
    return u.pathname; // strips domain, keeps /image/...
  } catch {
    // fallback (should not happen)
    return url;
  }
}
