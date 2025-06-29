import { createApp } from "vue";

// routes
import router from "./router";

// components
import App from "./App.vue";

// store
import { createPinia } from "pinia";

// styles
import "./style.css";

// ----------------------------------------------------------------------

if (import.meta.env.DEV) {
  import("./mocks");
}

const pinia = createPinia();

createApp(App).use(router).use(pinia).mount("#app");
