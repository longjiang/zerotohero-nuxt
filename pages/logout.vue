<router>
  {
    path: '/logout',
    props: true,
    meta: {
      skin: 'dark'
    },
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
          <h4 class="mt-5 mb-5 text-center">{{ translate('Logging you out...') }}</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
export default {
  data() {
    return {
      form: {
        email: "",
        password: ""
      },
      show: true
    };
  },
  mounted() {
    this.logout();
  },
  computed: {
    backgroundImage() {
      return Helper.background(this.$l2);
    },
    browserLanguage() {
      if (process.browser) {
        let code = navigator.language.replace(/-.*/, "");
        return code;
      }
      return "en";
    }
  },
  methods: {
    translate(text, code, data = {}) {
      if (!code) code = this.browserLanguage
      if (this.$languages) return this.$languages.translate(text, code, data);
      else return text;
    },
    async logout() {
      await this.$auth.logout();
      await this.$auth.setUser(null);
      this.$toast.success(
        this.translate("You have been logged out."),
        {
          position: "top-center",
          duration: 5000
        }
      );
      this.$router.push("/");
    }
  }
};
</script>
<style lang="scss" scoped>
.login-page {
  margin: 5rem auto 5rem auto;
  padding: 2rem;
  border-radius: 1rem;
  overflow: hidden;
  background: #ffffffbb;
  max-width: 20rem;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.483);
  backdrop-filter: blur(20px);
}
</style>