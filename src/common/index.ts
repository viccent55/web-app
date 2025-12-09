import type { NoteDetailInfo, UserDetailInfo } from "@/types/info";
import {
  type DropdownItem,
  type NavigationItem,
  type ExploreChannelItem,
  type ExploreFLoatSetItem,
} from "@/types/item";

export const dropDownItems1: DropdownItem[] = [
  {
    name: "创作服务",
  },
  {
    name: "直播管理",
  },
  {
    name: "电脑直播助手",
  },
];

export const dropDownItems2: DropdownItem[] = [
  {
    name: "专业号",
  },
  {
    name: "推广合作",
  },
  {
    name: "蒲公英",
  },
  {
    name: "商家入驻",
  },
  {
    name: "MCN入驻",
  },
];

export const dropDownItems3: DropdownItem[] = [
  {
    name: "关于小红书",
  },
  {
    name: "隐私、协议",
  },
  {
    name: "帮助与客服",
  },
  {
    divided: true,
    type: "text",
    name: "设置",
    loginRequired: true,
  },
  {
    name: "退出登录",
    loginRequired: true,
  },
];

export const dropDownItems4: DropdownItem[] = [
  ...dropDownItems1,
  ...dropDownItems2,
  ...dropDownItems3,
];

export const NavigationItems: NavigationItem[] = [
  {
    name: "发现",
    icon: "home-outline",
    type: "router-link",
    mode: "0",
    href: "/",
    routeName: "Home",
  },
  {
    name: "吃瓜",
    icon: "post-outline",
    type: "router-link",
    mode: "1",
    href: "/article",
    routeName: "Article",
  },
  {
    name: "禁区",
    icon: "movie-outline",
    type: "router-link",
    mode: "2",
    href: "/forbidden",
    routeName: "Forbidden",
  },
  {
    name: "约啪",
    icon: "heart-outline",
    type: "router-link",
    mode: "4",
    href: "/hookup",
    routeName: "Hookup",
  },
  {
    name: "我的",
    icon: "account-outline",
    type: "router-link",
    mode: "5",
    href: "/user",
    routeName: "UserId",
  },
];

export const ExploreChannelItems: EmptyArrayType = [
  {
    label: "推荐",
    value: "recommend",
  },
  {
    label: "穿搭",
    value: "clothing",
  },
  {
    label: "美食",
    value: "food",
  },
  {
    label: "彩妆",
    value: "cosmetics",
  },
  {
    label: "影视",
    value: "entertainment",
  },
  {
    label: "职场",
    value: "career",
  },
  {
    label: "情感",
    value: "love",
  },
  {
    label: "家居",
    value: "home",
  },
  {
    label: "游戏",
    value: "game",
  },
  {
    label: "旅行",
    value: "travel",
  },
  {
    label: "健身",
    value: "fitness",
  },
];

export const ExploreFloatSetItems: ExploreFLoatSetItem[] = [
  {
    icon: "Top",
    name: "goto-top",
    active: false,
  },
  {
    icon: "Refresh",
    name: "refresh",
    active: false,
  },
];

export const DefaultNoteDetailInfo: NoteDetailInfo = {
  article: {
    id: "-1",
    title: "",
    content: "",
    mediaInfo: {
      imageUrl: [],
    },
    action: {
      like_count: 0,
      commentCount: 0,
      collect_count: 0,
      isLike: false,
      isStar: false,
    },
    author: {
      id: 0,
      nickname: "",
      avatar: "",
      isFollow: false,
    },
    date: {
      date: "",
      location: "",
    },
    totalCommentCount: 0,
  },
  commentBlocks: [],
};

export const DefaultUserDetailInfo: UserDetailInfo = {
  id: 0,
  nickname: "",
  avatar: "",
  email: 0,
  slogan: 0,
  inviter: 0,
  invite_code: "",
  status: false,
  last_login: 0,
  created_at: "",
  updated_at: "",
  invite_count: 0,
  mode: 0,
  subscribed: 0,
  isFollow: false,
  visitor: "",
};

export const NotificationChannelItems: ExploreChannelItem[] = [
  {
    name: "评论和@",
    value: "comment",
  },
  {
    name: "赞和收藏",
    value: "like",
  },
  {
    name: "新增关注",
    value: "follow",
  },
];

export const UserChannelItems: ExploreChannelItem[] = [
  {
    name: "笔记",
    value: "note",
  },
  {
    name: "收藏",
    value: "star",
  },
  {
    name: "点赞",
    value: "like",
  },
];
