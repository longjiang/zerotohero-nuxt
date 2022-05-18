<router>
  {
    path: '/logout'
  }
</router>
<template>
  <div class="container">
    <div class="row">
      <div class="col-sm-12">
        <div class="login-page">
          <h3 class="mt-3 mb-5 text-center">Logout</h3>
          <b-button variant="success" @click="logout">Logout</b-button>
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
    async logout() {
      await this.$auth.setUser(null)
      this.$router.back()
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