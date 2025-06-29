import axios from "axios";

// ----------------------------------------------------------------------

export const API_ENDPOINTS = {
  auth: {
    me: "/api/auth/me",
    login: "/api/auth/login",
    signup: "/api/auth/signup",
    loginOtp: "/api/auth/login-otp",
    forgotPasswordRequest: "/api/auth/forgot-password/request",
    forgotPasswordVerifyOtp: "/api/auth/forgot-password/verify-otp",
    forgotPasswordReset: "/api/auth/forgot-password/reset",
  },
};
export default axios;
