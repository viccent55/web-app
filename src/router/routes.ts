import { type RouteRecordRaw } from "vue-router";

// Extend RouteMeta interface
declare module "vue-router" {
  interface RouteMeta {
    title?: string;
    isLink?: string;
    isHide?: boolean;
    isKeepAlive?: boolean;
    isAffix?: boolean;
    isIframe?: boolean;
    roles?: string[];
    icon?: string;
    isAuth?: boolean;
  }
}

export const CommonRoutes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Explore",
    // make sure the import path matches the real filesystem casing:
    component: () => import("@/Layouts/index.vue"),
    // redirect by route name (safer)
    redirect: { name: "Article" },
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("@/pages/home/index.vue"),
        meta: {
          title: "Home",
          isKeepAlive: true,
        },
      },
      {
        path: "category/:id",
        name: "Category",
        component: () => import("@/pages/category/index.vue"),
        meta: {
          title: "Category",
          isKeepAlive: true,
        },
      },
      {
        path: "article",
        name: "Article",
        component: () => import("@/pages/article/index.vue"),
        meta: {
          title: "Article",
          isKeepAlive: true,
        },
      },
      {
        path: "forbidden",
        name: "Forbidden",
        component: () => import("@/pages/forbidden/index.vue"),
        meta: {
          title: "Forbidden",
          isKeepAlive: true,
        },
      },
      {
        path: "hookup",
        name: "Hookup",
        component: () => import("@/pages/hookup/index.vue"),
        meta: {
          title: "Hookup",
          isKeepAlive: true,
        },
      },
      {
        path: "user/:id",
        name: "User",
        component: () => import("@/pages/user/index.vue"),
        meta: {
          title: "User",
          isKeepAlive: true,
        },
      },
    ],
  },
];

export const AuthorizeRoutes: Array<RouteRecordRaw> = [
  // add protected routes here, example:
  // {
  //   path: "/chat",
  //   name: "Chat",
  //   component: () => import("@/pages/chat/ChatPage.vue"),
  //   meta: { title: "ChatPage", isAuth: true },
  // },
];

export const ErrorRoutes: Array<RouteRecordRaw> = [
  {
    // correct catch-all pattern for vue-router 4
    path: "/:pathMatch(.*)*",
    name: "notFound",
    component: () => import("@/pages/error/404.vue"),
    meta: {
      title: "Not found 404!",
      isHide: true,
    },
  },
  {
    path: "/401",
    name: "noPower",
    component: () => import("@/pages/error/401.vue"),
    meta: {
      title: "Error 401!",
      isHide: true,
    },
  },
];
