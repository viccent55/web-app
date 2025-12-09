import { getPositionAds, getPopupNotice } from "@/service/advert";
import { useStore } from "@/stores";

export default function useHome() {
  const store = useStore();
  const getAdsPosition = async (position = 1) => {
    const respnse: any = await getPositionAds(position);
    const data = respnse?.data ?? [];
    if (position === 1) {
      store.homePopupAds = data;
    } else if (position === 2) {
      store.recommendAds = data;
    } else if (position === 3) {
      store.detailAppAds = data;
    } else if (position === 4) {
      store.detailAds = data;
    } else if (position === 5) {
      store.homeAds = data;
    }
  };

  const KEY = "last_report_alive";
  const shouldRunToday = () => {
    const last = localStorage.getItem(KEY);
    if (!last) return true;

    const lastDate = new Date(last);
    const now = new Date();

    // Compare YYYY-MM-DD only
    return (
      lastDate.getFullYear() !== now.getFullYear() ||
      lastDate.getMonth() !== now.getMonth() ||
      lastDate.getDate() !== now.getDate()
    );
  };
  const initAds = () => {
    getAdsPosition(1);
    getAdsPosition(2);
    getAdsPosition(3);
    getAdsPosition(4);
    getAdsPosition(5);
  };

  const getPopupnotice = async () => {
    try {
      const response = await getPopupNotice();
      store.popupNotice = response.data;
    } catch (error) {
      console.error("Error fetching popup notice:", error);
    }
  };
  onMounted(() => {
    getPopupnotice();
  });
  return {
    initAds,
    getPopupnotice,
  };
}
