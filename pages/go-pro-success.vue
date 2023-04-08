<router>
  {
    path: '/go-pro-success',
    props: true
  }
</router>
<template>
  <div
    :style="`min-height: 100vh; ${
      background
        ? 'background-image: url(' +
          background +
          '); background-size: cover; background-position: center;'
        : ''
    }`"
  >
    <SiteTopBar />
    <div class="go-pro-wrapper container">
      <div class="row">
        <div class="col-sm-12">
          <div>
            <Logo :forcePro="true" skin="light" class="logo" />
            <hr />
          </div>
          <div class="mt-4" />
          <h3 class="text-center mt-3">
            🎉 {{ translate("You’re now Pro!") }}
          </h3>
          <div class="mt-4" />
          <client-only>
            <div v-if="$auth.loggedIn && $auth.user && pro" class="text-center">
              <div>
                {{
                  translate(
                    "Welcome {name}, you now enjoy the benefit of a Pro account across all languages.",
                    { name: $auth.user ? $auth.user.first_name : "" }
                  )
                }}
              </div>
              <div class="mt-4"></div>
              <div>
                <router-link
                  :to="{ path: '/' }"
                  class="btn btn-success pl-4 pr-4"
                >
                  {{ translate("Start Using Pro") }}
                </router-link>
              </div>
            </div>
            <div v-else class="text-center">
              <p>
                {{
                  translate(
                    "Your upgrade was successful. Please login again to activate your Pro features."
                  )
                }}
              </p>
              <div class="mt-4" />
              <div>
                <router-link
                  :to="{ path: '/login?redirect=/' }"
                  class="btn btn-success pl-4 pr-4"
                >
                  {{ translate("Login with Pro") }}
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
import { PYTHON_SERVER } from "@/lib/utils/servers";
import { logError } from "@/lib/utils/error";
import axios from "axios";
import { background } from "@/lib/utils/background";

export default {
  async mounted() {
    if (this.$auth.loggedIn) {
      let email = this.$auth.user?.email;
      if (email) {
        let url = `${PYTHON_SERVER}upgrade_mailer_lite_subscriber_to_pro`;
        let res = await axios
          .post(url, { email })
          .catch((err) => logError(err));
      }
      await this.$auth.logout();
      await this.$auth.setUser(null);
    }
  },
  computed: {
    pro() {
      return this.forcePro || this.$store.state.subscriptions.active;
    },
    background() {
      return background();
    },
    browserLanguage() {
      if (process.browser) {
        let code = navigator.language.replace(/-.*/, "");
        return code;
      }
      return "en";
    },
  },
  methods: {
    translate(text, code) {
      if (!code) code = this.browserLanguage;
      if (this.$languages) return this.$languages.translate(text, code);
      else return text;
    },
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
