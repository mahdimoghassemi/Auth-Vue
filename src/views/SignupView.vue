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
const loading = ref(false);
const errorMsg = ref("");
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
  name: yup.string().required("Name is required"),
  email: yup.string().email().required("Email is required"),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(/^\+?\d{10,14}$/, "Invalid phone number"),
  password: yup.string().min(6).required("Password is required"),
  passwordConfirm: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

const schemaStep2 = yup.object({
  otp: yup
    .string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
});

const schema = computed(() => (step.value === 1 ? schemaStep1 : schemaStep2));

/**
 * ------------------------------------------------------------------------------------------------
 *  form setup
 * ------------------------------------------------------------------------------------------------
 */

const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  validateOnInput: false,
});

const { value: name, errorMessage: errorName } = useField("name");
const { value: email, errorMessage: errorEmail } = useField("email");
const { value: phone, errorMessage: errorPhone } = useField("phone");
const { value: password, errorMessage: errorPassword } = useField("password");
const { value: passwordConfirm, errorMessage: errorPasswordConfirm } =
  useField("passwordConfirm");
const { value: otp, errorMessage: errorOtp } = useField("otp");

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
      const res = await axios.post(API_ENDPOINTS.auth.signup, {
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });

      transactionId.value = res.data.data.transactionId;
      identifierValue.value = values.email;
      step.value = 2;
      resetForm();
    } else {
      // Submit OTP for verification
      await axios.post(API_ENDPOINTS.auth.verifySignupOtp, {
        email: identifierValue.value,
        otp: values.otp,
        transactionId: transactionId.value,
      });

      alert("Registration successful!");
      router.replace("/login");
    }
  } catch (err) {
    errorMsg.value =
      err.response?.data?.message || err.message || "Something went wrong";
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
    if (resendTimer.value > 0) resendTimer.value--;
    else clearInterval(intervalId);
  }, 1000);
};

watch(
  () => step.value,
  (newStep) => {
    if (newStep === 2) startTimer();
    else clearInterval(intervalId);
  }
);

onUnmounted(() => clearInterval(intervalId));

const resendOtp = async () => {
  if (!canResend.value) return;
  loading.value = true;
  try {
    await axios.post(API_ENDPOINTS.auth.signup, {
      email: identifierValue.value,
    });
    startTimer();
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "Failed to resend OTP";
  } finally {
    loading.value = false;
  }
};
</script>

<!-- ---------------------------- main ---------------------------- -->

<template>
  <div class="w-full min-h-screen flex justify-center items-center">
    <div class="shadow-2xl p-8 rounded-lg w-full max-w-md bg-white">
      <h2 class="text-xl font-semibold mb-6">Sign Up</h2>

      <form @submit.prevent="onSubmit" class="space-y-6">
        <template v-if="step === 1">
          <div>
            <label class="block mb-1 font-medium">Name</label>
            <input
              v-model="name"
              type="text"
              class="input"
              placeholder="Enter your name"
            />
            <p v-if="errorName" class="text-red-500 text-sm">{{ errorName }}</p>
          </div>

          <div>
            <label class="block mb-1 font-medium">Email</label>
            <input
              v-model="email"
              type="email"
              class="input"
              placeholder="Enter your email"
            />
            <p v-if="errorEmail" class="text-red-500 text-sm">
              {{ errorEmail }}
            </p>
          </div>

          <div>
            <label class="block mb-1 font-medium">Phone</label>
            <input
              v-model="phone"
              type="text"
              class="input"
              placeholder="Enter phone number"
            />
            <p v-if="errorPhone" class="text-red-500 text-sm">
              {{ errorPhone }}
            </p>
          </div>

          <div class="relative">
            <label class="block mb-1 font-medium">Password</label>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="input"
              placeholder="Password"
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
            <p v-if="errorPassword" class="text-red-500 text-sm">
              {{ errorPassword }}
            </p>
          </div>

          <div class="relative">
            <label class="block mb-1 font-medium">Confirm Password</label>
            <input
              v-model="passwordConfirm"
              :type="showPasswordConfirm ? 'text' : 'password'"
              class="input"
              placeholder="Confirm Password"
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
            <p v-if="errorPasswordConfirm" class="text-red-500 text-sm">
              {{ errorPasswordConfirm }}
            </p>
          </div>
        </template>

        <template v-else>
          <label class="block mb-1 font-medium">OTP</label>
          <input
            v-model="otp"
            maxlength="6"
            type="text"
            class="input"
            placeholder="Enter 6-digit OTP"
          />
          <p v-if="errorOtp" class="text-red-500 text-sm">{{ errorOtp }}</p>

          <button
            type="button"
            :disabled="!canResend || loading"
            @click="resendOtp"
            class="mt-2 px-3 py-2 rounded bg-blue-600 text-white disabled:bg-gray-400"
          >
            Resend OTP
            <span v-if="!canResend"> ({{ resendTimer }}s)</span>
          </button>
        </template>

        <span v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</span>

        <div class="mt-4 text-sm">
          <span class="text-gray-600">Back to Login?</span>
          <RouterLink to="/login" class="text-blue-500 ml-1 hover:underline">
            login
          </RouterLink>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          <span v-if="loading">Loading...</span>
          <span v-else>{{ step === 1 ? "Sign Up" : "Verify OTP" }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.input {
  @apply w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
}
</style>
