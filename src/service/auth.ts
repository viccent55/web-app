import service from "@/utils/request";

export function login(params?: object): Promise<EmptyObjectType> {
  return service.post("index/login", params);
}
export async function prepareRegister(
  params: object
): Promise<EmptyObjectType> {
  return service.post("index/prepareRegister", params);
}
export function register(params?: object): Promise<EmptyObjectType> {
  return service.post("index/register", params);
}

export async function forgotPassword(params: object): Promise<EmptyObjectType> {
  return service.post("index/forgotPassword", params);
}
export async function resetPassword(params: object): Promise<EmptyObjectType> {
  return service.post("index/setPassword", params);
}

export async function changePassword(params: object): Promise<EmptyObjectType> {
  return service.post("index/resetPassword", params);
}
