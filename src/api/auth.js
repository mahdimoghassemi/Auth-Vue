import axios from "axios";

export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    signup: "/api/auth/signup",
    me: "/api/auth/me",
    loginOtp: "/api/auth/login-otp",
  },
};

export default axios;
