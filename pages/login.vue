<router>
  {
    path: '/:l1/:l2/login/',
    props: true,
    meta: {
      skin: 'dark',
    }
  }
</router>
<template>
  <div
    class="container-fluid"
    :style="`${backgroundImage ? 'background-image: url(' + backgroundImage + '); background-size: cover; background-position: center;' : ''}`"
  >
    <div class="row">
      <div class="col-sm-12">
        <div :class="{ 'login-page': true, shaking }">
          <div class="text-center mb-4">
            <img
              src="/img/czh-icon.png"
              style="height: 5.5rem; margin-bottom: 1rem"
              data-not-lazy
            />
            <br />
            <h4>Zero to Hero</h4>
          </div>
          <b-form @submit.prevent="onSubmit">
            <div class="alert alert-warning" v-if="$l2.code === 'zh'">
              <b>Friendly reminder:</b>
              This does NOT login to your Chinese Zero to Hero online courses on
              Teachable. For course login
              <a
                href="https://chinesezerotohero.teachable.com/"
                target="_blank"
              >
                click here
              </a>
              .
            </div>
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

            <b-form-group id="input-group-2" label-for="password">
              <b-form-input
                id="password"
                type="password"
                v-model="form.password"
                placeholder="Password"
                required
              ></b-form-input>
            </b-form-group>

            <b-button class="d-block w-100" type="submit" variant="success">
              Login
            </b-button>
            <div class="mt-3 text-center">
              <router-link :to="{ name: 'register' }">
                Create an Account
                <i class="fas fa-chevron-right ml-1"></i>
              </router-link>
            </div>
          </b-form>
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
        password: "",
      },
      shaking: false,
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
        let res = await this.$auth.loginWith("local", { data: this.form });
        if (res && res.data && res.data.data && res.data.data.user) {
          let user = res.data.data.user
          this.$auth.setUser(user);
          this.$toast.success(`Welcome back, ${this.$auth.user.first_name}!`, {
            position: "top-center",
            duration: 5000,
          });
          this.$router.push({ name: "profile" });

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
  margin: 2rem auto 5rem auto;
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