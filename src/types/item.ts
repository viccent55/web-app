// 下拉菜单选项

export interface DropdownItem {
  type?: "link" | "text";
  divided?: boolean;
  name?: string;
  href?: string;
  loginRequired?: boolean;
}

// 底部/侧面导航选项
export interface NavigationItem {
  type: "router-link" | "external-link";
  name: string;
  icon: string;
  mode: string;
  href: string;
  routeName: string;
}

//浏览频道选项
export interface ExploreChannelItem {
  name: string;
  value: string;
}

export interface ExploreFLoatSetItem {
  icon: string;
  name: string;
  active: boolean;
}
