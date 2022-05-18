<router>
  {
    path: '/login'
  }
</router>
<template>
  <div class="container">
    <div class="row">
      <div class="col-sm-12">
        <div class="login-page">
          <h3 class="mt-3 mb-5 text-center">Login</h3>
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

            <b-button type="submit" variant="primary">Login</b-button>
          </b-form>
          <b-card class="mt-3" header="Form Data Result">
            <pre class="m-0">{{ form }}</pre>
          </b-card>
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
  methods: {
    async onSubmit(event) {
      let res = await axios.post(`${Config.wiki}auth/authenticate`, this.form);
      if (res && res.data && res.data.data) {
        let data = res.data.data;
        let token = data.token;
        let user = data.user;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.login-page {
  margin: 2rem 0px 5rem 0;
  padding: 2rem;
  border-radius: 1rem;
  overflow: hidden;
  background: white;
}
</style>