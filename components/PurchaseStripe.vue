<template>
  <span class="purchase-stripe">
    <stripe-checkout
      ref="stripeCheckoutUSDRef"
      mode="payment"
      :pk="stripePublishableKey"
      :line-items="[
        {
          price: 'price_1LArBtG5EbMGvOaflIKUthub', // USD price for all other payment methods
          quantity: 1,
        },
      ]"
      :success-url="stripeSuccessURL"
      :cancel-url="stripeCancelURL"
      @loading="(v) => (loading = v)"
    />
    <b-button
      @click="submitStripeUSD"
      variant=" pl-3 pr-3"
      size="sm"
      style="
        position: relative;
        bottom: 0.5rem;
        padding: 0.1rem;
        background-color: #ffc439;
      "
    >
      <i class="fas fa-credit-card"></i>
      <i class="fab fa-cc-apple-pay"></i>
      <i class="fab fa-google-pay mr-1"></i>
      Credit Card
    </b-button>
    <a
      href="https://buy.stripe.com/4gw2bz7ELbvR8CccMN"
      class="btn btn-sm pl-3 pr-3"
      style="
        position: relative;
        bottom: 0.5rem;
        padding: 0.1rem;
        background-color: #ffc439;
      "
    >
      <i class="fab fa-weixin mr-1"></i>
      WeChat Pay
    </a>
    <a
      href="https://buy.stripe.com/4gw2bz7ELbvR8CccMN"
      class="btn btn-sm pl-3 pr-3"
      style="
        position: relative;
        bottom: 0.5rem;
        padding: 0.1rem;
        background-color: #ffc439;
      "
    >
      <i class="fab fa-alipay mr-1"></i>
      Alipay
    </a>
  </span>
</template>

<script>
import { PYTHON_SERVER } from "@/lib/utils/servers";
import { HOST } from "@/lib/utils/url";

export default {
  data() {
    this.stripePublishableKey = "pk_live_9lnc7wrGHtcFdPKIWZdy9p17";

    return {
      stripeSuccessURL: this.$auth.user
        ? `${PYTHON_SERVER}stripe_checkout_success?user_id=${this.$auth.user.id}&host=${HOST}&session_id={CHECKOUT_SESSION_ID}`
        : undefined, // Make sure we have the user's id
      stripeCancelURL: HOST + "/go-pro",
    };
  },
  methods: {
    submitStripeUSD() {
      // You will be redirected to Stripe's secure checkout page
      this.$refs.stripeCheckoutUSDRef.redirectToCheckout();
    },
  },
};
</script>

<style>
</style>