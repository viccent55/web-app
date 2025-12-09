import { createRouter, createWebHashHistory } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import "@/assets/css/nprogress-custom.css";
import { CommonRoutes, AuthorizeRoutes, ErrorRoutes } from "@/router/routes";
import { useStore } from "@/stores";

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [...CommonRoutes, ...AuthorizeRoutes, ...ErrorRoutes],
});

router.beforeEach((to, from, next) => {
  NProgress.configure({ showSpinner: false });
  NProgress.start();
  // const store = useStore();
  // if (to.meta.isAuth && !store.tokens.access_token) {
  //   next({ name: "Login" });
  //   NProgress.done();
  // } else if (to.path === "/" && store.tokens.access_token)
  //   next({ name: from.name });
  // else {
  //   next();
  //   NProgress.done();
  // }
  next();
});
router.afterEach(() => {
  NProgress.done();
});
export default router;
