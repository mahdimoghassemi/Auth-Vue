import { createRouter, createWebHistory } from "vue-router";

// components
import LoginView from "../views/LoginView.vue";
import SignupView from "../views/SignupView.vue";
import ForgotView from "../views/ForgotView.vue";
import DashboardView from "../views/DashboardView.vue";

// ----------------------------------------------------------------------

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    component: LoginView,
  },
  {
    path: "/forgot",
    component: ForgotView,
  },
  {
    path: "/signup",
    component: SignupView,
  },
  {
    path: "/dashboard",
    component: DashboardView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
