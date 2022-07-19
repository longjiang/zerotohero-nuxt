<router>
  {
    path: '/go-pro',
    props: true
  }
</router>
<template>
  <div class="bg">
    <SiteTopBar />
    <div class="go-pro-wrapper container">
      <div class="row">
        <div class="col-sm-12">
          <client-only>
            <div>
              <Logo :forcePro="true" skin="light" class="logo" />
            </div>
            <div class="mt-4"></div>
            <div class="text-seoncdary bg-white p-3 rounded">
              <h5 class="text-center">Pro users can</h5>
              <ul class="list-unstyled">
                <li>
                  <i class="fas fa-check-circle text-success"></i>
                  See full transcripts of videos
                </li>
                <li>
                  <i class="fas fa-check-circle text-success"></i>
                  See all video search results from the dictionary
                </li>
                <li>
                  <i class="fas fa-check-circle text-success"></i>
                  Have access to an
                  <em><b>ocean</b></em>
                  of language-learning material
                </li>
              </ul>
              <StatsComp skin="light" variant="summary" />
              <div class="mt-2 text-center">
                <router-link :to="{ name: 'stats' }" class="text-primary">
                  <small>
                    Full stats of all languages
                    <i class="fas fa-angle-right ml-1"></i>
                  </small>
                </router-link>
              </div>
            </div>
            <div class="mt-4"></div>
            <div v-if="$auth.loggedIn && $auth.user" class="text-center">
              <div v-if="![1, 4].includes(Number($auth.user.role))">
                <div class="text-center bg-white rounded p-3">
                  <div class="user-avatar"><i class="fas fa-user"></i></div>
                  <h6>
                    {{ $auth.user.first_name }} {{ $auth.user.last_name }}
                  </h6>
                  <div>{{ $auth.user.email }}</div>
                </div>
                <div class="mt-4"></div>
                <p>Let's get make you Pro.</p>
              </div>
              <div class="mt-3"></div>
              <div v-if="[1, 4].includes(Number($auth.user.role))">
                <h5 class="mb-3">🎉 You are already Pro! 🚀 Enjoy!</h5>
                <router-link class="btn btn-primary mb-3" to="/">
                  Start Using Pro
                </router-link>
              </div>
              <div v-else class="mb-3">
                <div>
                  <div class="pl-5">
                    <sup style="font-size: 1rem">$</sup>
                    <span style="font-size: 2.2rem; font-weight: bold">89</span>
                    <sup style="font-size: 1rem">/ lifetime</sup>
                  </div>
                </div>
                <client-only>
                  <div v-if="native">
                    <div class="mt-3 mb-4">
                      <PurchaseiOS />
                    </div>
                  </div>
                  <div v-else>
                    <div class="mt-3 mb-4">
                      Please choose your method of payment:
                    </div>
                    <div>
                      <PurchaseStripe />
                      <PurchasePayPal />
                    </div>
                  </div>
                </client-only>
              </div>
            </div>
            <div v-else class="text-center">
              <p style="font-size: 1.2em">
                Before you get Pro, you need to create an account.
              </p>
              <div>
                <router-link
                  :to="{ path: '/register?redirect=/go-pro' }"
                  class="btn btn-primary mb-3"
                >
                  Create an Account
                  <i class="fas fa-chevron-right"></i>
                </router-link>
                <br />
                <router-link
                  :to="{ path: '/login?redirect=/go-pro' }"
                  class="text-secondary"
                >
                  Already have an account? Please
                  <u>login</u>
                  .
                </router-link>
              </div>
            </div>
          </client-only>
          <div class="text-center" v-if="!native">
            If you have any questions or issues, please
            <a href="mailto:jon.long@zerotohero.ca">email us</a>
            .
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Capacitor } from "@capacitor/core";

export default {
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    pro() {
      return [1, 4].includes(Number(this.$auth.user?.role)) ? true : false;
    },
    native() {
      return Capacitor.isNativePlatform();
    },
  },
  methods: {
  },
};
</script>
<style scoped lang="scss">
.bg {
  min-height: 100vh;
  color: rgb(40, 40, 40);
}
.logo {
  margin-top: -5.5rem;
}
.go-pro-wrapper {
  margin-top: 5rem;
  margin-bottom: 5rem;
  max-width: 30rem;
  padding: 2rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.7333333333);
  box-shadow: 0 0 30px rgb(0 0 0 / 48%);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
}

.user-avatar {
  background-color: #fd5f22;
  color: white;
  border-radius: 100%;
  height: 3rem;
  width: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  i {
    font-size: 1.5rem;
  }
}
</style>