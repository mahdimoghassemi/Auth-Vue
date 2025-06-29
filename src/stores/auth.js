// stores
import { defineStore } from "pinia";

// components
import axios, { API_ENDPOINTS } from "../api/auth";

// jwt
import { setSession, isValidToken } from "../utils/jwt";

// ----------------------------------------------------------------------

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    loading: true,
  }),

  getters: {
    authenticated: (state) => !!state.user,
  },

  actions: {
    async initialize() {
      const token = localStorage.getItem("accessToken");
      if (token && isValidToken(token)) {
        setSession(token);
        try {
          const res = await axios.get(API_ENDPOINTS.auth.me);
          this.user = res.data.data;
        } catch (e) {
          this.user = null;
        }
      } else {
        this.user = null;
      }
      this.loading = false;
    },

    async login({ email, password }) {
      const res = await axios.post(API_ENDPOINTS.auth.login, {
        email,
        password,
      });

      const transactionId = res.data.data.transactionId || "mock-tx-id";
      return transactionId;
    },

    async loginOtp({ email, transactionId, otp }) {
      const res = await axios.get(
        `${API_ENDPOINTS.auth.loginOtp}/${transactionId}/${otp}`
      );

      const token = res?.data?.data?.token;
      setSession(token);

      const resUser = await axios.get(API_ENDPOINTS.auth.me);
      this.user = resUser.data.data;
    },

    async register(data) {
      const res = await axios.post(API_ENDPOINTS.auth.signup, data);
      const token = res.data.data.token;
      setSession(token);

      const resUser = await axios.get(API_ENDPOINTS.auth.me);
      this.user = resUser.data.data;
    },

    logout() {
      setSession(null);
      this.user = null;
    },
  },
});
