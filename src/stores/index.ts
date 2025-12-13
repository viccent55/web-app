import { defineStore } from "pinia";

export const useStore = defineStore("store", {
  state: () => {
    return {
      apiEndPoint: "",
      search: "",
      lang: "",
      cloudHost: [],
      darkMode: "light",
      configuration: <EmptyObjectType>{},
      chan: "",
      mainAds: {} as EmptyObjectType,
      baseImage64: "",
      isInstalled: false,
      homePopupAds: [] as EmptyArrayType,
      recommendAds: [] as EmptyArrayType,
      detailAppAds: [] as EmptyArrayType,
      detailAds: [] as EmptyArrayType,
      homeAds: [] as EmptyArrayType,
      localVersion: 1,
      channel: "",
      popupNotice: [] as EmptyArrayType,
      ads: {} as EmptyObjectType,
    };
  },
  actions: {
    toggleTheme() {
      this.darkMode = this.darkMode === "dark" ? "light" : "dark";
    },
    setTheme(name: "light" | "dark") {
      this.darkMode = name;
    },
  },
  persist: true,
});
