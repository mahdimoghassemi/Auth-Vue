import { createApp } from "vue";

// routes
import router from "./router";

// components
import App from "./App.vue";

// styles
import "./style.css";

// ----------------------------------------------------------------------

createApp(App).use(router).mount("#app");
