// Vuetify imports
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import colors from "vuetify/util/colors";
import { VFileUpload } from "vuetify/labs/VFileUpload";

const vuetify = createVuetify({
  components: {
    ...components,
    VFileUpload,
  },
  directives,
  defaults: {
    VDialog: {
      scrollStrategy: "reposition",
    },
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          background: colors.grey.lighten4,
          surface: "#fefefeff",
          primary: colors.red.darken1,
          secondary: "#2196F3",
          accent: "#82B1FF",
          error: "#FF5252",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FFC107",
        },
      },
      dark: {
        dark: true,
        colors: {
          background: "#121212",
          surface: "#212121",
          primary: colors.red.darken1,
          secondary: "#2196F3",
          accent: "#82B1FF",
          error: "#FF5252",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FFC107",
        },
      },
    },
  },
});

export default vuetify;
