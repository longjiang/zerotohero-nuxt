<router>
  {
    path: '/go-pro',
    props: true,
    meta: {
      skin: 'dark'
    }
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
    <div class="pt-5 pb-5 container">
      <div class="row">
        <div class="col-sm-12">
          <div v-if="sale" class="bg-primary text-white p-3 rounded text-center mb-5" style="max-width: 46rem; margin: 0 auto; font-size: 1.2em" >
            <div><b>FALL SALE!</b> 50% off on lifetime Pro account upgrade</div>
            <small style="text-small">Offer ends Sunday 28 Aug</small>
          </div>
          <client-only>
            <div class="mt-4"></div>
            <FeatureComparison :sale="sale" />
            <div v-if="$auth.loggedIn && $auth.user" class="text-center text-white">
              <div v-if="[1, 4].includes(Number($auth.user.role))">
                <h5 class="mb-3">🎉 You are already Pro! 🚀 Enjoy!</h5>
                <router-link class="btn btn-success mb-3" to="/">
                  Start Using Pro
                </router-link>
              </div>
              <div v-else class="mb-3 text-white">
                <client-only>
                  <div class="mt-5 mb-4">
                    <h5>Ready to upgrade to Pro?</h5>
                  </div>
                  <div v-if="native">
                    <div class="pt-4 pb-5">
                      <PurchaseiOS :sale="sale" />
                    </div>
                  </div>
                  <div v-else>
                    <div>
                      <p>Please choose your method of payment.</p>
                      <PurchaseStripe :sale="sale" />
                      <PurchasePayPal :sale="sale" />
                    </div>
                  </div>
                </client-only>
              </div>
            </div>
            <div v-else class="text-center text-white">
              <p style="font-size: 1.2em">
                Before you get Pro, you need to create an account.
              </p>
              <div>
                <router-link
                  :to="{ path: '/register?redirect=/go-pro' }"
                  class="btn btn-success mb-3"
                >
                  Create an Account
                  <i class="fas fa-chevron-right"></i>
                </router-link>
                <br />
                <router-link
                  :to="{ path: '/login?redirect=/go-pro' }"
                  class="text-white"
                >
                  Already have an account? Please
                  <u>login</u>
                  .
                </router-link>
              </div>
            </div>
          </client-only>
          <div class="text-center text-white" v-if="!native">
            If you have any questions or issues, please
            <a href="mailto:jon.long@zerotohero.ca" class="text-white"><u>email us</u></a>
            .
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Capacitor } from "@capacitor/core";
import { background } from "@/lib/utils/background";

export default {
  data() {
    return {
      loading: false,
      sale: true
    };
  },
  computed: {
    background() {
      return background();
    },
    pro() {
      return [1, 4].includes(Number(this.$auth.user?.role)) ? true : false;
    },
    native() {
      return Capacitor.isNativePlatform();
    },
  },
  methods: {},
};
</script>
<style scoped lang="scss">

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