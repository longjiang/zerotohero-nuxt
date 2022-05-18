<router>
  {
    path: '/:l1/:l2/register/'
  }
</router>
<template>
  <div class="container">
    <div class="row">
      <div class="col-sm-12">
        <div class="login-page">
          <div class="text-center mb-4">
            <h4>Create an Account</h4>
          </div>
          <b-form @submit.prevent="onSubmit" v-if="show">
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

            <b-button class="d-block w-100" type="submit" variant="success">Sign Up</b-button>
            <div class="mt-3 text-center"><router-link :to="{name: 'login'}">I have an account <i class="fas fa-chevron-right ml-1"></i></router-link></div>
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
        email: "jon@chinesezerotohero.com",
        password: "X6w8pG@azXj_9H@v7bPBVyfZ",
      },
      show: true,
    };
  },
  methods: {
    async onSubmit(event) {
      try {
        let response = await this.$auth.loginWith("local", { data: this.form });
        const res = await axios.get(
          `https://db2.zerotohero.ca/zerotohero/users/me?access_token=${this.$auth.strategy.token
            .get()
            .replace("Bearer ", "")}`
        );
        if (res && res.data && res.data.data) {
          this.$auth.setUser(res.data.data);
          this.$router.back();
          this.$toast.success(`Welcome back, ${res.data.data.first_name}!`, {position: 'top-center', duration: 5000})
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