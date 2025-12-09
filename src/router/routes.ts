// routes.ts
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
    component: () => import("@/Layouts/index.vue"),
    // you *can* keep redirect if you want "/" → Article
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

      // ✅ 404 as a *child* under the layout
      {
        path: ":pathMatch(.*)*",
        name: "notFound",
        component: () => import("@/pages/error/404.vue"),
        meta: {
          title: "Not found 404!",
          isHide: true,
        },
      },
    ],
  },
];

export const AuthorizeRoutes: Array<RouteRecordRaw> = [
  // protected routes here if needed
];

// You can keep /401 as a separate top-level route if you want:
export const ErrorRoutes: Array<RouteRecordRaw> = [
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
