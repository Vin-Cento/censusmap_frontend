// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import "@fortawesome/fontawesome-free/css/all.css"; // Ensure your project is capable of handling css files
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, fa } from "vuetify/iconsets/fa";

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "dark",
    themes: {
      light: {
        colors: {
          primary: "#1867C0",
          secondary: "#5CBBF6",
          background: "#000",
        },
      },
    },
  },
  // https://vuetifyjs.com/en/features/icon-fonts/
  icons: {
    defaultSet: "fa",
    aliases,
    sets: {
      fa,
    },
  },
});
