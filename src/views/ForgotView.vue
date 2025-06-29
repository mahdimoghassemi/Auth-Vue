<script setup>
import * as yup from "yup";
import { ref, computed, watch, onUnmounted } from "vue";

// hooks
import { useForm, useField } from "vee-validate";

// routes
import { useRouter } from "vue-router";

// components
import axios, { API_ENDPOINTS } from "../api/auth";

// ICONS
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/solid";

// ----------------------------------------------------------------------

const router = useRouter();

/**
 * ------------------------------------------------------------------------------------------------
 *  ref
 * ------------------------------------------------------------------------------------------------
 */

const step = ref(1);
const errorMsg = ref("");
const loading = ref(false);
const resendTimer = ref(120);
const transactionId = ref("");
const identifierValue = ref("");
const showPassword = ref(false);
const showPasswordConfirm = ref(false);

let intervalId = null;
const canResend = computed(() => resendTimer.value === 0);

/**
 * ------------------------------------------------------------------------------------------------
 *  schema
 * ------------------------------------------------------------------------------------------------
 */

const schemaStep1 = yup.object({
  identifier: yup
    .string()
    .required("Email or phone is required")
    .test("is-email-or-phone", "Invalid email or phone", (value) => {
      const phoneRegex = /^\+?\d{10,14}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return phoneRegex.test(value) || emailRegex.test(value);
    }),
});

const schemaStep2 = yup.object({
  otp: yup
    .string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
});

const schemaStep3 = yup.object({
  password: yup
    .string()
    .min(6, "Password min 6 chars")
    .required("Password is required"),
  passwordConfirm: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

const schema = computed(() => {
  if (step.value === 1) return schemaStep1;
  if (step.value === 2) return schemaStep2;
  return schemaStep3;
});

const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  validateOnInput: false,
});

const { value: identifier, errorMessage: errorIdentifier } =
  useField("identifier");
const { value: otp, errorMessage: errorOtp } = useField("otp");
const { value: password, errorMessage: errorPassword } = useField("password");
const { value: passwordConfirm, errorMessage: errorPasswordConfirm } =
  useField("passwordConfirm");

/**
 * ------------------------------------------------------------------------------------------------
 *  submit handler
 * ------------------------------------------------------------------------------------------------
 */

const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  errorMsg.value = "";

  try {
    if (step.value === 1) {
      const res = await axios.post(API_ENDPOINTS.auth.forgotPasswordRequest, {
        identifier: values.identifier,
      });

      transactionId.value = res.data.data.transactionId;
      identifierValue.value = values.identifier;
      step.value = 2;
      resetForm();
    } else if (step.value === 2) {
      await axios.post(API_ENDPOINTS.auth.forgotPasswordVerifyOtp, {
        identifier: identifierValue.value,
        transactionId: transactionId.value,
        otp: values.otp,
      });

      step.value = 3;
      resetForm();
    } else {
      await axios.post(API_ENDPOINTS.auth.forgotPasswordReset, {
        identifier: identifierValue.value,
        transactionId: transactionId.value,
        password: values.password,
      });

      alert("Password successfully changed!");
      router.replace("/login");
    }
  } catch (err) {
    errorMsg.value =
      err.response?.data?.message || err.message || "Error occurred";
  } finally {
    loading.value = false;
  }
});

/**
 * ------------------------------------------------------------------------------------------------
 *  OTP handler
 * ------------------------------------------------------------------------------------------------
 */

const startTimer = () => {
  resendTimer.value = 120;
  intervalId = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--;
    } else {
      clearInterval(intervalId);
    }
  }, 1000);
};

watch(
  () => step.value,
  (newStep) => {
    if (newStep === 2) {
      startTimer();
    } else {
      clearInterval(intervalId);
    }
  }
);

onUnmounted(() => {
  clearInterval(intervalId);
});

const resendOtp = async () => {
  if (!canResend.value) return;

  loading.value = true;
  errorMsg.value = "";

  try {
    await axios.post(API_ENDPOINTS.auth.forgotPasswordRequest, {
      identifier: identifierValue.value,
    });

    resendTimer.value = 120;
    startTimer();
  } catch (err) {
    errorMsg.value =
      err.response?.data?.message || err.message || "Error occurred";
  } finally {
    loading.value = false;
  }
};
</script>

<!-- ---------------------------- main ---------------------------- -->

<template>
  <div class="w-[100%] min-h-screen flex justify-center items-center">
    <div class="shadow-2xl p-8 rounded-lg w-full max-w-md bg-white">
      <h2 class="text-xl font-semibold mb-6">Forgot Password</h2>

      <form @submit.prevent="onSubmit" class="space-y-6">
        <div v-if="step === 1">
          <label class="block mb-1 font-medium">Email or Phone</label>
          <input
            v-model="identifier"
            type="text"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email or phone"
          />
          <p v-if="errorIdentifier" class="text-red-500 text-sm mt-1">
            {{ errorIdentifier }}
          </p>
        </div>

        <div v-else-if="step === 2">
          <label class="block mb-1 font-medium">OTP Code</label>
          <input
            v-model="otp"
            maxlength="6"
            type="text"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter 6-digit OTP"
          />
          <p v-if="errorOtp" class="text-red-500 text-sm mt-1">
            {{ errorOtp }}
          </p>

          <button
            type="button"
            :disabled="!canResend || loading"
            @click="resendOtp"
            class="mt-4 px-2 py-2 rounded-md bg-blue-600 text-white disabled:bg-gray-400 hover:bg-blue-700 transition"
          >
            resend OTP
            <span v-if="!canResend"> ({{ resendTimer }})</span>
          </button>
        </div>
        <div v-else>
          <label class="block mb-1 font-medium">New Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="New password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-2.5"
            >
              <component
                :is="showPassword ? EyeIcon : EyeSlashIcon"
                class="w-5 h-5 text-gray-500"
              />
            </button>
          </div>
          <p v-if="errorPassword" class="text-red-500 text-sm mt-1">
            {{ errorPassword }}
          </p>

          <label class="block mt-4 mb-1 font-medium">Confirm Password</label>
          <div class="relative">
            <input
              v-model="passwordConfirm"
              :type="showPasswordConfirm ? 'text' : 'password'"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              @click="showPasswordConfirm = !showPasswordConfirm"
              class="absolute right-3 top-2.5"
            >
              <component
                :is="showPasswordConfirm ? EyeIcon : EyeSlashIcon"
                class="w-5 h-5 text-gray-500"
              />
            </button>
          </div>
          <p v-if="errorPasswordConfirm" class="text-red-500 text-sm mt-1">
            {{ errorPasswordConfirm }}
          </p>
        </div>
        <span v-if="errorMsg" class="text-red-500 text-sm mt-2">{{
          errorMsg
        }}</span>

        <div class="mt-4 text-sm">
          <span class="text-gray-600">Back to Login?</span>
          <RouterLink to="/login" class="text-blue-500 ml-1 hover:underline">
            login
          </RouterLink>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded-3xl hover:bg-blue-700 transition duration-300 mt-4"
        >
          <span v-if="loading">Loading...</span>
          <span v-else>
            {{
              step === 1
                ? "Send OTP"
                : step === 2
                ? "Verify OTP"
                : "Reset Password"
            }}
          </span>
        </button>
      </form>
    </div>
  </div>
</template>
