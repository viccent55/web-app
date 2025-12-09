import service from "@/utils/request";
import { getNoteDetail, getStatus } from "@/service/getMethod";

export async function newVisitor(params: object): Promise<EmptyObjectType> {
  const res: EmptyObjectType = service.post("/index/newVisitor", params);
  return res;
}

// Active Visitor
export async function activeVisitor(params: object): Promise<EmptyObjectType> {
  const res: EmptyObjectType = await service.post(
    "/index/activeVisitor",
    params
  );
  return res;
}

export function getExploreFeeds(params: object): Promise<EmptyObjectType> {
  return service.post("/item/recommend", params);
}
export const getComments = async (
  id: string | number
): Promise<EmptyObjectType> => {
  const res = await service.post("/item/comments", {
    id: id,
  });
  return res;
};

export async function like(params: object) {
  const res: EmptyObjectType = await service.post("/like/toggle", params);
  return res;
}
export async function collect(params: object) {
  const res: EmptyObjectType = await service.post("/favorite/toggle", params);
  return res;
}

export async function follow(params: object) {
  const res: EmptyObjectType = await service.post("/member/follow", params);
  return res;
}
export async function reply(params: EmptyObjectType) {
  const res: EmptyObjectType = await service.post("/member/comment", params);
  return res;
}

export async function detail(params: EmptyObjectType) {
  return await getNoteDetail(params.id, params.code);
}
export async function detailAuth(params: EmptyObjectType) {
  const res: EmptyObjectType = await service.post("/content/detail", params);
  return res;
}

export async function search(params: EmptyObjectType) {
  const res: EmptyObjectType = await service.post("/member/search", params);
  return res;
}
export async function status(params: object) {
  return service.post("/member/follow/status", params);

}
