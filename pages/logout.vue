<router>
  {
    path: '/:l1/:l2/logout',
    props: true
  }
</router>
<template>
  <div class="container">
    <div class="row">
      <div class="col-sm-12">
        <div class="login-page">
          <h3 class="mt-3 mb-5 text-center">Logging out...</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
  mounted() {
    this.logout();
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
    async logout() {
      await this.$auth.setUser(null);
      this.$toast.success(`You're now logged out.`, {
        position: "top-center",
        duration: 5000,
      });
      this.$router.push({
        name: "all-media",
        params: { l1: this.$l1.code, l2: this.$l2.code },
      });
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