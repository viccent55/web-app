
import { createApp } from "vue";
import pinia from "@/plugins/pinia";
import App from "./App.vue";
import router from "./router";
import vuetify from "@/plugins/vuetify";
import MasonryWall from "@yeger/vue-masonry-wall";
import "./assets/css/main.scss";
import { initBootstrap } from "@/bootstrap";
initBootstrap();

const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(vuetify);
app.use(MasonryWall);
router.isReady().then(() => {
  app.mount("#app");
});
