import { jwtDecode } from "jwt-decode";

export const isValidToken = (token) => {
  if (!token) return false;
  const decoded = jwtDecode(token);
  const now = Date.now() / 1000;
  return decoded.exp > now;
};

export const setSession = (token) => {
  if (token) {
    localStorage.setItem("accessToken", token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("accessToken");
    delete axios.defaults.headers.common.Authorization;
  }
};
