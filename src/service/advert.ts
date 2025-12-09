import service from "@/utils/request";

import { gePostionAds } from "./getMethod";
export const getPositionAds = async (
  position: number
): Promise<EmptyObjectType> => {
  const res: EmptyObjectType = await gePostionAds(position);
  return res;
};

export function adsClick(id: number): Promise<EmptyObjectType> {
  return service.post("/advert/click", {
    id: id,
  });
}

export function itemAdClick(id: number): Promise<EmptyObjectType> {
  return service.post("/advert/itemAdClick", {
    id: id,
  });
}

export async function getPopupNotice() {
  return service.get("/popupNotice/list", {
    method: "GET",
  });
}
