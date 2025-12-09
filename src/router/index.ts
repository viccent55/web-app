// index.ts
import { createRouter, createWebHashHistory } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import "@/assets/css/nprogress-custom.css";
import { CommonRoutes, AuthorizeRoutes, ErrorRoutes } from "@/router/routes";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [...CommonRoutes, ...AuthorizeRoutes, ...ErrorRoutes],
});

router.beforeEach((to, from, next) => {
  NProgress.configure({ showSpinner: false });
  NProgress.start();
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
