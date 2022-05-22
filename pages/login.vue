<router>
  {
    path: '/:l1/:l2/login/'
  }
</router>
<template>
  <div class="container">
    <div class="row">
      <div class="col-sm-12">
        <div class="login-page">
          <div class="text-center mb-4">
            <img
              src="/img/czh-icon.png"
              style="height: 5.5rem; margin-bottom: 1rem"
              data-not-lazy
            />
            <br />
            <h4>Zero to Hero</h4>
          </div>
          <b-form @submit.prevent="onSubmit" v-if="show">
            <div class="alert alert-warning" v-if="$l2.code === 'zh'">
              <b>Notice:</b>
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
import Config from "@/lib/config";

export default {
  data() {
    return {
      form: {
        email: "",
        password: "",
      },
      show: true,
    };
  },
  computed: {
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
        await this.$auth.loginWith("local", { data: this.form });
        const res = await this.$authios.get(
          `https://db2.zerotohero.ca/zerotohero/users/me`
        );
        if (res && res.data && res.data.data) {
          this.$auth.setUser(res.data.data);
          this.$router.back();
          this.$toast.success(`Welcome back, ${res.data.data.first_name}!`, {
            position: "top-center",
            duration: 5000,
          });
        }
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.login-page {
  margin: 5rem auto 5rem auto;
  padding: 2rem;
  border-radius: 1rem;
  overflow: hidden;
  background: #ffffffdd;
  max-width: 20rem;
  box-shadow: 0 0 30px black;
  backdrop-filter: blur(20px);
}
</style>