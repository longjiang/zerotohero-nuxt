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
            <div class="text-center text-seoncdary bg-white p-3 rounded">
              <p style="font-size: 1.2em">
                With Pro 🚀, you'll have access to full transcripts of an
                <em><b>ocean</b></em>
                of language-learning videos!
              </p>
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
              <p style="font-size: 1.2em">
                Welcome
                <b>{{ $auth.user ? $auth.user.first_name : "" }}</b>
                , let's get you started with a Pro account.
              </p>
              <div class="mt-4"></div>
              <div v-if="[1, 4].includes(Number($auth.user.role))">
                <p>You are already Pro. Enjoy!</p>
                <router-link class="btn btn-primary mb-3" to="/">
                  Back to Homepage
                </router-link>
              </div>
              <div v-else>
                <stripe-checkout
                  ref="checkoutRef"
                  mode="payment"
                  :pk="publishableKey"
                  :line-items="lineItems"
                  :success-url="successURL"
                  :cancel-url="cancelURL"
                  @loading="(v) => (loading = v)"
                />
                <b-button @click="submit" variant="primary mb-3 pl-3 pr-3">
                  Proceed to Checkout
                  <i class="fas fa-chevron-right"></i>
                </b-button>
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
          <div class="text-center">
            If you have any questions or issues, please
            <a href="mailto:jon@chinesezerotohero.com">email us</a>
            .
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { HOST } from "@/lib/utils/url";

export default {
  data() {
    this.publishableKey = "pk_live_9lnc7wrGHtcFdPKIWZdy9p17";
    return {
      loading: false,
      lineItems: [
        {
          price: "price_1LABcPG5EbMGvOaffNy5LykY", // The id of the one-time price you created in your Stripe dashboard
          quantity: 1,
        },
      ],
      successURL: this.$auth.user
        ? `https://python.zerotohero.ca/stripe_checkout_success?user_id=${this.$auth.user.id}&host=${HOST}&session_id={CHECKOUT_SESSION_ID}`
        : undefined, // Make sure we have the user's id
      cancelURL: HOST + "/go-pro",
    };
  },
  computed: {
    pro() {
      return [1, 4].includes(Number(this.$auth.user?.role)) ? true : false;
    },
  },
  methods: {
    submit() {
      // You will be redirected to Stripe's secure checkout page
      this.$refs.checkoutRef.redirectToCheckout();
    },
  },
};
</script>
<style scoped>
.bg {
  min-height: 100vh;
  color: rgb(40, 40, 40);
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