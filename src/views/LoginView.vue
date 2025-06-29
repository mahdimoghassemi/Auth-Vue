<script setup>
import * as yup from "yup";
import { ref, computed } from "vue";

// hooks
import { useForm, useField } from "vee-validate";

// routes
import { useRouter } from "vue-router";

// store
import { useAuthStore } from "../stores/auth";

// ICONS
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from "@heroicons/vue/24/solid";

// ----------------------------------------------------------------------

const router = useRouter();
const authStore = useAuthStore();

/**
 * ------------------------------------------------------------------------------------------------
 *  ref
 * ------------------------------------------------------------------------------------------------
 */

const step = ref(1);
const loading = ref(false);
const transactionId = ref("");
const identifierValue = ref("");
const showPassword = ref(false);

/**
 * ------------------------------------------------------------------------------------------------
 *  schema
 * ------------------------------------------------------------------------------------------------
 */

const schemaStep1 = yup.object({
  identifier: yup
    .string()
    .required("Phone number or email is required")
    .test("is-email-or-phone", "Invalid email or phone number", (value) => {
      const phoneRegex = /^\+?\d{10,14}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return phoneRegex.test(value) || emailRegex.test(value);
    }),
  password: yup.string().required("Password is required"),
});

const schemaStep2 = yup.object({
  otp: yup
    .string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
});

const schema = computed(() => (step.value === 1 ? schemaStep1 : schemaStep2));

const { handleSubmit, errors, validate } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  validateOnInput: false,
});
const { value: identifier } = useField("identifier");
const { value: password } = useField("password");
const { value: otp } = useField("otp");

/**
 * ------------------------------------------------------------------------------------------------
 *  submit handler
 * ------------------------------------------------------------------------------------------------
 */

const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  try {
    if (step.value === 1) {
      const txId = await authStore.login({
        email: values.identifier,
        password: values.password,
      });

      identifierValue.value = values.identifier;
      transactionId.value = txId;
      step.value = 2;
    } else {
      await authStore.loginOtp({
        email: identifierValue.value,
        transactionId: transactionId.value,
        otp: values.otp,
      });
      router.replace("/dashboard");
    }
  } catch (err) {
    alert(err.message || "Error occurred");
  } finally {
    loading.value = false;
  }
});

/**
 * ------------------------------------------------------------------------------------------------
 *  back handler
 * ------------------------------------------------------------------------------------------------
 */

const goBack = () => {
  router.back();
};
</script>

<!-- ---------------------------- main ---------------------------- -->

<template>
  <button
    type="button"
    @click="goBack"
    class="m-10 text-blue-600 flex items-center text-sm"
  >
    <ArrowLeftIcon class="w-4 h-4 mr-1" />

    back
  </button>
  <div class="w-[100%] min-h-screen flex justify-center items-center">
    <form
      @submit.prevent="onSubmit"
      class="shadow-2xl p-8 rounded-lg w-full max-w-md bg-white"
    >
      <h2 class="text-xl font-semibold mb-6">
        {{ step === 1 ? "Login" : "Enter OTP" }}
      </h2>

      <div v-if="step === 1" class="mb-4">
        <div class="mb-2">
          <label for="identifier" class="block mb-1 text-sm"
            >Email or Phone</label
          >
          <input
            id="identifier"
            v-model="identifier"
            type="text"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email or phone"
          />
          <span class="text-red-500 text-sm mt-2">{{ errors.identifier }}</span>
        </div>

        <div class="mb-2">
          <label for="password" class="block mb-1 text-sm">Password</label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
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
          <span class="text-red-500 text-sm mt-2">{{ errors.password }}</span>

          <div class="mt-4">
            <RouterLink
              to="/forgot"
              class="text-blue-500 text-sm hover:underline"
            >
              forgot password?
            </RouterLink>
          </div>
        </div>
      </div>

      <div v-else class="mb-4">
        <label for="otp" class="block mb-2 text-sm">OTP Code</label>
        <input
          id="otp"
          v-model="otp"
          type="text"
          maxlength="6"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="6-digit code"
        />
        <span class="text-red-500 text-sm mt-2">{{ errors.otp }}</span>
      </div>

      <button
        type="submit"
        class="w-full bg-blue-600 text-white py-2 rounded-3xl hover:bg-blue-700 transition duration-300 mt-4"
        :disabled="loading"
      >
        <span v-if="loading">Processing...</span>
        <span v-else>{{ step === 1 ? "Send OTP" : "Verify and Login" }}</span>
      </button>
      <div class="flex justify-center items-center mt-4 text-sm">
        <span class="text-gray-600">Don't have an account?</span>
        <RouterLink
          to="/auth/signup"
          class="text-blue-500 ml-1 hover:underline"
        >
          Sign Up
        </RouterLink>
      </div>
    </form>
  </div>
</template>

<style scoped>
input:disabled {
  background-color: #f9f9f9;
}
</style>
