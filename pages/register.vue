<router>
  {
    path: '/register',
    meta: {
      skin: 'dark'
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
    <div class="row">
      <div class="col-sm-12">
        <div class="login-page">
          <div class="text-center mb-4">
            <Logo skin="light" />
          </div>
          <b-form @submit.prevent="onSubmit" v-if="show">
            <div class="d-flex mb-3">
              <b-form-input
                id="first_name"
                v-model="form.first_name"
                type="text"
                placeholder="First Name"
                required
                style="flex: 1"
                class="mr-1"
              ></b-form-input>
              <b-form-input
                id="last_name"
                v-model="form.last_name"
                type="text"
                placeholder="Last Name"
                required
                style="flex: 1"
                class="ml-1"
              ></b-form-input>
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
              Sign Up
            </b-button>
            <div class="mt-3 text-center">
              <router-link
                :to="{
                  name: 'login',
                  query: { redirect: $route.query.redirect },
                }"
              >
                I have an account
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
import Config from "@/lib/config";

export default {
  data() {
    return {
      form: {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: 3,
        status: "active",
      },
      show: true,
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
        const res = await axios.post(
          `https://db2.zerotohero.ca/zerotohero/users`,
          this.form
        );
        if (res && res.data && res.data.public === true) {
          // Directus isn't returning users for some reason, let's get it

          let response = await this.$auth.loginWith("local", {
            data: this.form,
          });
          if (response && response.data) {
            response = await this.$authios.get(`${Config.wiki}users/me`);
            if (response.data && response.data.data) {
              let user = response.data.data;
              this.$auth.setUser(user);
              this.$toast.success(
                `Registration successful. Welcome aboard, ${this.form.first_name}!`,
                {
                  position: "top-center",
                  duration: 5000,
                }
              );
              if (this.$route.query.redirect) {
                this.$router.push({ path: this.$route.query.redirect });
              } else {
                if (this.$l1 && this.$l2)
                  this.$router.push({
                    name: "profile",
                    params: { l1: this.$l1.code, l2: this.$l2.code },
                  });
                else this.$router.push("/");
              }
            }
          }
        }
      } catch (err) {
        Helper.logError(err);
        if (err.response && err.response.data) {
          let message = err.response.data.error.message;
          if (err.response.data.error.code === 204) {
            message = `Your email ${this.form.email} has already been registered, please login.`;
            this.$router.push({
              name: "login",
              params: {
                message: `Your email ${this.form.email} has already been registered, please login.`,
              },
            });
          }
          this.$toast.error(message, {
            position: "top-center",
            duration: 5000,
          });
        } else {
          this.$toast.error("There has been an error.", {
            position: "top-center",
            duration: 5000,
          });
        }
      }
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
</style>