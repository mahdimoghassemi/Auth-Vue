import MockAdapter from "axios-mock-adapter";

// components
import axios, { API_ENDPOINTS } from "../api/auth";

// ----------------------------------------------------------------------

if (import.meta.env.DEV) {
  const mock = new MockAdapter(axios, { delayResponse: 1000 });

  // Mock Login
  mock.onPost(API_ENDPOINTS.auth.login).reply((config) => {
    const { email, password } = JSON.parse(config.data);

    if (email === "test@example.com" && password === "123456") {
      return [
        200,
        {
          data: {
            token: "fake-token",
          },
        },
      ];
    }

    return [401, { message: "ایمیل یا رمز عبور اشتباه است" }];
  });

  // ----------------------------------------------------------------------

  // Mock Login OTP
  mock.onGet(new RegExp(`${API_ENDPOINTS.auth.loginOtp}/*`)).reply((config) => {
    const urlParts = config.url.split("/");
    const otp = urlParts.pop();
    const transactionId = urlParts.pop();

    if (otp === "123456") {
      return [
        200,
        {
          data: {
            token: "otp-login-token",
          },
        },
      ];
    }

    return [401, { message: "کد تایید اشتباه است" }];
  });

  // ----------------------------------------------------------------------

  // Mock Get Me
  mock.onGet(API_ENDPOINTS.auth.me).reply(200, {
    data: {
      name: "کاربر تستی",
      email: "test@example.com",
      companies: [{ id: 1, name: "شرکت تستی" }],
    },
  });

  // Mock Signup
  mock.onPost(API_ENDPOINTS.auth.signup).reply((config) => {
    const { email } = JSON.parse(config.data);
    return [
      200,
      {
        data: {
          token: "new-fake-token",
        },
      },
    ];
  });

  // ----------------------------------------------------------------------

  // Mock Request Reset OTP
  mock.onPost(API_ENDPOINTS.auth.forgotPasswordRequest).reply((config) => {
    const { identifier } = JSON.parse(config.data);

    if (identifier) {
      return [
        200,
        {
          data: {
            transactionId: "mock-transaction-id-1234",
          },
        },
      ];
    }

    return [400, { message: "Invalid identifier" }];
  });

  // ----------------------------------------------------------------------

  // Mock Forget OTP
  mock.onPost(API_ENDPOINTS.auth.forgotPasswordVerifyOtp).reply((config) => {
    const { otp } = JSON.parse(config.data);

    if (otp === "123456") {
      return [200, { data: { success: true } }];
    }

    return [401, { message: "Invalid OTP code" }];
  });

  // Mock Change Password
  mock.onPost(API_ENDPOINTS.auth.forgotPasswordReset).reply((config) => {
    const { password } = JSON.parse(config.data);

    if (password && password.length >= 6) {
      return [200, { data: { success: true } }];
    }

    return [400, { message: "Password too short" }];
  });
}
