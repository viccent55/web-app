import service from "@/utils/request";
import { getUserInfo as UserInfo } from "@/service/getMethod";

export async function getUserInfo(id: number): Promise<EmptyObjectType> {
  const res = await UserInfo(id);
  return res;
}

export async function getNoteFeeds(params: object): Promise<EmptyObjectType> {
  return service.post(`/member/items`, params);
}

export async function getStarFeeds(params: object): Promise<EmptyObjectType> {
  return service.post(`/item/myCollect`, params);
}

export async function getLikeFeeds(params: object): Promise<EmptyObjectType> {
  return service.post(`/item/myLike`, params);
}
export async function getFollowFeed(params: object): Promise<EmptyObjectType> {
  return service.post(`/member/followings`, params);
}

export async function setUserInfo(params: object): Promise<EmptyObjectType> {
  return service.post(`/member/setinfo`, params);
}
export async function retrySendEmailCode(
  params: EmptyObjectType
): Promise<EmptyObjectType> {
  return service.post(`/index/retrySendEmailCode`, params);
}

export async function veryCode(
  params: EmptyObjectType
): Promise<EmptyObjectType> {
  return service.post(`/index/register`, params);
}
export async function changePassword(
  params: EmptyObjectType
): Promise<EmptyObjectType> {
  return service.post(`/member/resetPassword`, params);
}

export async function getMemberActive(
  params: EmptyObjectType
): Promise<EmptyObjectType> {
  return service.post(`/member/active`, params);
}

export async function getInvitedLogs(
  params: EmptyObjectType
): Promise<EmptyObjectType> {
  return service.post(`/member/inviteLogs`, params);
}
export async function getHistories(
  params: EmptyObjectType
): Promise<EmptyObjectType> {
  return service.post("/browse/logs", params);
}

export async function getConfigs(params: object) {
  return service.post("/config/settings", params);
}
