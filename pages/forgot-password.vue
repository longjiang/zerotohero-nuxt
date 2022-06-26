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
            <div class="reset-form" v-if="!emailSent">
              <div class="alert alert-warning" v-if="$l2 && $l2.code === 'zh'">
                <b>Friendly reminder:</b>
                This does NOT login to your Chinese Zero to Hero online courses
                on Teachable. For course login
                <a
                  href="https://chinesezerotohero.teachable.com/"
                  target="_blank"
                >
                  click here
                </a>
                .
              </div>
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
              <div class="mt-4 text-center">
                <router-link to="/login">Go back</router-link>
                <!-- <p @click="$router.go(-1)" class="text-secondary">Go back</p> -->
              </div>
            </div>
            <div class="email-sent" v-else>
              <div class="alert alert-success">
                <h5 class="mb-3">
                  <i class="fas fa-check mr-1"></i>
                  Email sent!
                </h5>
                <p>
                  You'll receive a link to reset your password at
                  <b>{{ form.email }}</b>
                  shortly.
                </p>
                <p>
                  Please check your spam or junk folder before submitting a new
                  request.
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
import Config from "@/lib/config";
import axios from "axios";

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
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  methods: {
    async onSubmit(event) {
      try {
        this.emailSending = true;
        let host = process.server
          ? process.env.baseUrl
          : window.location.protocol +
            "//" +
            window.location.hostname +
            ":" +
            window.location.port;
        let res = await axios.post(`${Config.wiki}auth/password/request`, {
          email: this.form.email,
          reset_url: `${host}/password-reset`,
        });
        if (res && res.status === 200) {
          this.emailSent = true;
          this.emailSending = false;
        }
      } catch (err) {
        if (err.response && err.response.data) {
          this.$toast.error(err.response.data.error.message, {
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