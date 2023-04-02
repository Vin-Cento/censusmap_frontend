import { createApp } from "vue";
import "./style.css";
import router from "@/router/index";
import vuetify from "@/plugins/vuetify";
import App from "@/App.vue";

const app = createApp(App);
app.use(vuetify);
app.use(router).mount("#app");
