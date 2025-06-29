import { createRouter, createWebHistory } from "vue-router";

// components
import OtpView from "../views/OtpView.vue";
import LoginView from "../views/LoginView.vue";
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
    path: "/otp",
    component: OtpView,
  },
  {
    path: "/forgot",
    component: ForgotView,
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
