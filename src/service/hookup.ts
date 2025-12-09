import service from "@/utils/request";

export async function getConfig(param: object) {
  return service.post("/girl/config", param);
}
export async function findList(params: object): Promise<EmptyObjectType> {
  return service.post("/girl/findList", params);
}

export async function detail(params: object) {
  return service.post("/girl/findDetail", params);
}

export async function like(params: object) {
  return service.post("/like/toggle", params);
}

export async function collect(params: object) {
  return service.post("/favorite/toggle", params);
}
export async function getPointConfig(
  params: object = {}
): Promise<EmptyObjectType> {
  return service.post("/points/config", params);
}
export async function getBalance(
  params: object = {}
): Promise<EmptyObjectType> {
  return service.post("/points/balance", params);
}
export async function getLogs(params: object): Promise<EmptyObjectType> {
  return service.post("/points/logs", params);
}
export async function reedemPoint(
  params: object = {}
): Promise<EmptyObjectType> {
  return service.post("/points/sign", params);
}
