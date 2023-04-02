<template>
  <div class="purchase-stripe">
    <stripe-checkout
      ref="stripeCheckoutUSDRef"
      mode="payment"
      :pk="stripePublishableKey"
      :line-items="[
        {
          price, // USD price for all other payment methods
          quantity: 1,
        },
      ]"
      :success-url="stripeSuccessURL"
      :cancel-url="stripeCancelURL"
      @loading="(v) => (loading = v)"
    />
    <b-button @click="submitStripeUSD" variant="success btn-purchase" size="md">
      <span class="icons">
        <i class="fas fa-credit-card"></i>
        <i class="fab fa-cc-apple-pay"></i>
        <i class="fab fa-google-pay mr-1"></i>
      </span>
      {{ translate('Credit Card') }}
      <i class="fa-solid fa-chevron-right ml-1"></i>
    </b-button>
    <a
      :href="cnyPaymentURL"
      class="btn btn-success btn-purchase"
    >
      <span class="icons"><i class="fab fa-weixin"></i></span>
      {{ translate('WeChat Pay') }}
      <i class="fa-solid fa-chevron-right ml-1"></i>
    </a>
    <a
      :href="cnyPaymentURL"
      class="btn btn-success btn-purchase"
    >
      <span class="icons"><i class="fab fa-alipay"></i></span>
      {{ translate('Alipay') }}
      <i class="fa-solid fa-chevron-right ml-1"></i>
    </a>
  </div>
</template>

<script>
import { PYTHON_SERVER } from "@/lib/utils/servers";
import { HOST } from "@/lib/utils/url";

export default {
  props: {
    sale: {
      default: false
    },
    test: {
      default: false
    }
  },
  computed: {
    cnyPaymentURL() {
      return this.test ? this.testPriceCNYPaymentLink : this.sale ? this.salePriceCNYPaymentLink : this.regularPriceCNYPaymentLink
    },
    price() {
      return this.test ? this.testPriceID :this.sale ? this.salePriceID : this.regularPriceID
    },
    browserLanguage() {
      if (process.browser) {
        let code = navigator.language.replace(/-.*/, "");
        return code;
      }
      return "en";
    },
  },
  data() {
    this.stripePublishableKey = "pk_live_9lnc7wrGHtcFdPKIWZdy9p17";

    return {
      regularPriceCNYPaymentLink: 'https://buy.stripe.com/4gw2bz7ELbvR8CccMN',
      salePriceCNYPaymentLink: 'https://buy.stripe.com/dR6dUhcZ51VhaKkdQT',
      testPriceCNYPaymentLink:'https://buy.stripe.com/fZe2bz0cjczV9Gg4gi',
      regularPriceID: 'price_1LArBtG5EbMGvOaflIKUthub',
      salePriceID: 'price_1LaUOfG5EbMGvOaf3HQLg8sL',
      testPriceID: 'price_1L9zlDG5EbMGvOafpz7PnnGt',
      stripeSuccessURL: this.$auth.user
        ? `${PYTHON_SERVER}stripe_checkout_success?user_id=${this.$auth.user.id}&host=${HOST}&session_id={CHECKOUT_SESSION_ID}`
        : undefined, // Make sure we have the user's id
      stripeCancelURL: HOST + "/go-pro",
    };
  },
  methods: {
    translate(text, code) {
      if (!code) code = this.browserLanguage;
      if (this.$languages) return this.$languages.translate(text, code);
      else return text;
    },
    submitStripeUSD() {
      // You will be redirected to Stripe's secure checkout page
      this.$refs.stripeCheckoutUSDRef.redirectToCheckout();
    },
  },
};
</script>

<style lang="scss" scoped>
.btn-purchase {
  display: block;
  margin: 0.25rem auto 0.25rem auto;
  text-align: left;
  width: 15.5rem;
  position: relative;
  .icons {
    width: 5rem;
    display: inline-block;
    text-align: center;
  }
  .fa-chevron-right {
    position: absolute;
    right: 0.75rem;
    top: 0.75rem;
  }
}
</style>