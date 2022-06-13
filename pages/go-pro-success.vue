<router>
  {
    path: '/go-pro-success',
    props: true
  }
</router>
<template>
  <div class="bg">
    <SiteTopBar />
    <div class="go-pro-wrapper container">
      <div class="row">
        <div class="col-sm-12">
          <div>
            <Logo :forcePro="true" skin="light" class="logo" />
            <hr />
          </div>
          <div class="mt-4" />
          <h3 class="text-center mt-3">🎉 You’re now Pro!</h3>
          <div class="mt-4" />
          <client-only>
            <div v-if="$auth.loggedIn && $auth.user && pro" class="text-center">
              <div>
                Welcome
                <b>{{ $auth.user ? $auth.user.first_name : "" }}</b>, you now enjoy the benefit of a Pro account across all languages.
              </div>
              <div class="mt-4"></div>
              <div>
                <router-link
                  :to="{ path: '/' }"
                  class="btn btn-primary pl-4 pr-4"
                >
                  Yay!
                </router-link>
              </div>
            </div>
            <div v-else class="text-center">
              <p>
                Your upgrade was successful. Please login again to activate your
                Pro features.
              </p>
              <div class="mt-4" />
              <div>
                <router-link
                  :to="{ path: '/login?redirect=/go-pro-success' }"
                  class="btn btn-primary pl-4 pr-4"
                >
                  Login
                  <i class="fas fa-chevron-right"></i>
                </router-link>
              </div>
            </div>
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";

export default {
  computed: {
    pro() {
      return [1, 4].includes(Number(this.$auth.user?.role)) ? true : false;
    },
  },
  async mounted() {
    if (this.$auth.loggedIn) {
      let response = await this.$authios.get(`${Config.wiki}users/me`);
      if (response.data && response.data.data) {
        let user = response.data.data;
        this.$auth.setUser(user);
        if (this.pro) {
          this.$toast.success(
            `Congrats ${this.$auth.user.first_name}, you're now Pro!`,
            {
              position: "top-center",
              duration: 5000,
            }
          );
        }
      }
    }
  },
};
</script>
<style scoped>
.bg {
  min-height: 100vh;
}
.logo {
  margin-top: -5.5rem;
}
.go-pro-wrapper {
  margin-top: 10rem;
  max-width: 30rem;
  padding: 2rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.7333333333);
  box-shadow: 0 0 30px rgb(0 0 0 / 48%);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
}
</style>