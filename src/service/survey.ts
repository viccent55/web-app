import service from "@/utils/request";

export async function survey(params: object) {
  return await service.post("/survey", params);
}

