<router>
  {
    path: '/forgot-password',
    props: true,
    meta: {
      skin: 'dark',
    }
  }
</router>
<template>
  <div
    :style="`min-height: 100vh; ${
      backgroundImage
        ? 'background-image: url(' +
          backgroundImage +
          '); background-size: cover; background-position: center;'
        : ''
    }`"
  >
    <client-only>
      <SiteTopBar />
    </client-only>
    <div class="container">
      <div class="row">
        <div class="col-sm-12 pt-5">
          <div :class="{ 'login-page': true, shaking }">
            <div class="text-center mb-4">
              <Logo skin="light" />
            </div>
            <div class="reset-form" v-if="!emailSent">
              <b-form @submit.prevent="onSubmit">
                <p class="mb-3">Enter your email to recover your password:</p>
                <div v-if="message" class="alert alert-danger mt-2">
                  {{ message }}
                </div>
                <b-form-group id="input-group-1" label-for="email">
                  <b-form-input
                    id="email"
                    v-model="form.email"
                    type="email"
                    placeholder="Email"
                    required
                  ></b-form-input>
                </b-form-group>

                <b-button
                  class="d-block w-100"
                  type="submit"
                  variant="success"
                  v-if="!emailSending"
                >
                  Continue
                </b-button>
                <div class="text-center" v-else>
                  <Loader
                    :sticky="true"
                    message="Sending password reset email..."
                  />
                </div>
              </b-form>
            </div>
            <div class="email-sent" v-else>
              <div class="alert alert-success">
                <h5 class="mb-3">
                  <i class="fas fa-check mr-1"></i>
                  Password reset email on its way
                </h5>
                <p>
                  We're sending a password reset email which can take up to a minute to arrive. Please check your spam inbox just to make sure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";

export default {
  props: {
    message: String,
  },
  data() {
    return {
      form: {
        email: "",
      },
      shaking: false,
      emailSending: false,
      emailSent: false,
    };
  },
  computed: {
    backgroundImage() {
      return Helper.background(this.$l2);
    },
  },
  methods: {
    async onSubmit(event) {
      try {
        this.emailSending = true;
        let email = this.form.email;
        let sent = await this.$directus.sendPasswordResetEmail({ email });
        if (sent) {
          this.emailSent = true;
          this.emailSending = false;
        }
      } catch (err) {
        console.log(err)
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
        this.emailSending = false;
        this.shake();
      }
    },
    async shake() {
      this.shaking = true;
      await Helper.timeout(500);
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