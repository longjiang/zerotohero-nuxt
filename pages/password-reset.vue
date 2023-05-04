<router>
  {
    path: '/password-reset',
    meta: {
      skin: 'dark',
    }
  }
</router>
<template>
  <div
    class="container-fluid pt-5"
    :style="`min-height: 100vh; ${
      backgroundImage
        ? 'background-image: url(' +
          backgroundImage +
          '); background-size: cover; background-position: center;'
        : ''
    }`"
  >
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div :class="{ 'login-page': true, shaking }">
            <div class="text-center mb-4">
              <Logo skin="light" />
            </div>
            <b-form @submit.prevent="onSubmit" v-if="token">
              <div class="alert alert-success">
                <i class="fas fa-check mr-1"></i>
                {{ $tb('Email verified.') }}
              </div>
              <p class="mb-3">{{ $tb('Enter your new password:') }}</p>

              <b-form-group id="input-group-2" label-for="password">
                <b-form-input
                  id="password"
                  type="password"
                  v-model="form.password"
                  placeholder="Password"
                  required
                ></b-form-input>
              </b-form-group>

              <b-button
                class="d-block w-100"
                type="submit"
                variant="success"
                v-if="!resetting"
              >
                {{ $tb('Reset Password') }}
              </b-button>
              <div class="text-center" v-else>
                <Loader :sticky="true" message="Changing your password..." />
              </div>
            </b-form>
            <div v-else>
              <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle mr-1"></i>
                {{ $tb('Password reset token is missing.') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { timeout, background, logError } from "@/lib/utils";

export default {
  data() {
    return {
      form: {
        password: "",
      },
      resetting: false,
      reset: false,
      shaking: false,
      token: undefined
    };
  },
  computed: {
    backgroundImage() {
      return background(this.$l2);
    },
  },
  mounted() {
    this.token = this.$route.query?.token
  },
  methods: {
    async onSubmit(event) {
      try {
        this.resetting = true;
        let token = this.token;
        let password = this.form.password;
        let reset = this.$directus.resetPassword({ token, password })
        if (reset) {
          this.$toast.success("Your password has been updated, please login.", {
            position: "top-center",
            duration: 5000,
          });
          this.$router.push({path: '/login' });
          this.resetting = false;
        }
      } catch (err) {
        logError(err);
        if (err.response?.data?.error?.message) {
          this.$toast.error(err.response?.data?.error?.message, {
            position: "top-center",
            duration: 5000,
          });
        } else {
          this.$toast.error("There has been an error.", {
            position: "top-center",
            duration: 5000,
          });
        }
        this.resetting = false;
        this.shake();
      }
    },
    async shake() {
      this.shaking = true;
      await timeout(500);
      this.shaking = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.login-page {
  margin: 2rem auto 2rem auto;
  padding: 2rem;
  border-radius: 1rem;
  overflow: hidden;
  background: #ffffffbb;
  max-width: 20rem;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.483);
  backdrop-filter: blur(20px);
}

.shaking {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
  animation-iteration-count: infinite;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>