import service from "@/utils/request";

export async function articlList(params: object) {
  return await service.post("/scand/select", params);
}
export async function detail(params: object) {
  return await service.post("/scand/detail", params);
}

export async function comments(params: object) {
  return await service.post("/scand/comments", params);
}

export async function like(params: object) {
  return await service.post("/like/toggle", params);
}

export async function collect(params: object) {
  return await service.post("/favorite/toggle", params);
}
export async function comment(params: EmptyObjectType) {
  return await service.post("/behavior/commentScand", params);
}
