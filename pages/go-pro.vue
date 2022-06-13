<router>
  {
    path: '/go-pro',
    props: true
  }
</router>
<template>
  <div class="main container mt-5 p-4 rounded shadow">
    <div class="row">
      <div class="col-sm-12">
        <div v-if="!pro">
          <h3>Pro benefits</h3>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum
            porro quam praesentium dicta mollitia expedita tempore, eaque
            cum placeat sunt odio maiores, doloribus illum aspernatur
            temporibus quasi! Eveniet, tempore magnam.
          </p>
        </div>
        <div v-if="$auth.loggedIn && $auth.user">
          <div>
            Welcome, 
            <b>{{ $auth.user ? $auth.user.email : "" }}</b>
            (ID: {{ $auth.user.id }})
            <span class="ml-2" />
            <router-link to="/logout">Logout</router-link>
          </div>
          <div class="mt-3"></div>
          <div v-if="[1, 4].includes(Number($auth.user.role))">
            <p>You are already Pro. Enjoy!</p>
            <router-link class="btn btn-success" to="/">
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
            <b-button @click="submit" variant="success">
              Buy Pro
              <i class="fas fa-chevron-right"></i>
            </b-button>
          </div>
        </div>
        <div v-else>
          <p>Before you get Pro, you need to login, or create an account.</p>
          <router-link
            :to="{ path: '/register?redirect=/go-pro' }"
            class="btn btn-success"
          >
            Create an Account
            <i class="fas fa-chevron-right"></i>
          </router-link>
          <span class="mr-1" />
          <router-link
            :to="{ path: '/login?redirect=/go-pro' }"
            class="btn btn-secondary"
          >
            Login
            <i class="fas fa-chevron-right"></i>
          </router-link>
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
          price: "price_1L9zlDG5EbMGvOafpz7PnnGt", // The id of the one-time price you created in your Stripe dashboard
          quantity: 1,
        },
      ],
      successURL: this.$auth.user
        ? `https://python.zerotohero.ca/stripe_checkout_success?user_id=${this.$auth.user.id}&host=${HOST}&session_id={CHECKOUT_SESSION_ID}`
        : undefined, // Make sure we have the user's id
      cancelURL: HOST + "/go-pro-cancel",
    };
  },
  computed: {
    pro() {
      return [1, 4].includes(Number(this.$auth.user?.role)) ? true : false
    }
  },
  methods: {
    submit() {
      // You will be redirected to Stripe's secure checkout page
      this.$refs.checkoutRef.redirectToCheckout();
    },
  },
};
</script>