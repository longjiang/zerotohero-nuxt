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
        <div class="col-sm-12 text-dark">
          <div>
            <Logo :forcePro="true" skin="light" class="logo" />
            <hr />
          </div>
          <div class="mt-4" />
          <client-only>
            <div v-if="$auth.loggedIn && $auth.user" class="text-center">
              <div v-if="pro">
                <h3 class="text-center mt-3">
                  🎉 {{ $tb("You’re now Pro!") }}
                </h3>
                <div class="mt-4" />
                <div>
                  {{
                    $tb(
                      "Welcome {name}, you now enjoy the benefit of a Pro account across all languages.",
                      { name: $auth.user ? $auth.user.first_name : "" }
                    )
                  }}
                </div>
                <div class="mt-4"></div>
                <div>
                  <router-link
                    :to="{ name: 'dashboard' }"
                    class="btn btn-success pl-4 pr-4"
                  >
                    {{ $tb("Start Using Pro") }}
                    <i class="fas fa-chevron-right"></i>
                  </router-link>
                </div>
              </div>
              <div v-else-if="checking" class="mt-5 mb-5 text-center">
                <Loader
                  :sticky="true"
                  :message="$tb('Checking your Pro subscription...')"
                />
              </div>
            </div>
            <div v-else class="text-center">
              <p>
                {{ $tb("Please login to verify your Pro status.") }}
              </p>
              <div class="mt-4" />
              <div>
                <router-link
                  :to="{ path: '/login?redirect=/go-pro-success' }"
                  class="btn btn-success pl-4 pr-4"
                >
                  {{ $tb("Login") }}
                  <i class="fas fa-chevron-right"></i>
                </router-link>
              </div>
              <div class="mt-3">
                <small>
                  {{
                    $tb(
                      "If you’ve purchased Pro but the system did not update your account, please contact us:"
                    )
                  }}
                  <a href="mailto:jon.long@zerotohero.ca">{{
                    $tb("Send us an email")
                  }}</a>
                </small>
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
      await this.$store.dispatch(
        "subscriptions/checkSubscription",
        this.$auth.user.id
      );
    }
  },
  computed: {
    checking() {
      return this.$store.state.subscriptions.checking;
    },
    pro() {
      return this.forcePro || this.$store.state.subscriptions.active;
    },
    background() {
      return background();
    },
  },
  methods: {},
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
