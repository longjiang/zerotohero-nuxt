<template>
  <div class="purchase-stripe">
    <template v-if="usdPrice">
      <stripe-checkout
        ref="stripeCheckoutUSDRef"
        :mode="usdPrice.mode"
        :pk="stripePublishableKey"
        :line-items="[
          {
            price: usdPrice.id,
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
    </template>
    <template v-if="cnyPrice">
      <a
      :href="cnyPrice.paymentLink"
      class="btn btn-success btn-purchase"
    >
      <span class="icons"><i class="fab fa-weixin"></i></span>
      {{ translate('WeChat Pay') }}
      <i class="fa-solid fa-chevron-right ml-1"></i>
    </a>
    <a
      :href="cnyPrice.paymentLink"
      class="btn btn-success btn-purchase"
    >
      <span class="icons"><i class="fab fa-alipay"></i></span>
      {{ translate('Alipay') }}
      <i class="fa-solid fa-chevron-right ml-1"></i>
    </a>
    </template>
  </div>
</template>

<script>
import { PYTHON_SERVER } from "@/lib/utils/servers";
import { HOST } from "@/lib/utils/url";

export default {
  props: {
    plan: {
      default: 'lifetime'
    },
    type: {
      default: 'regular'
    },
  },
  computed: {
    usdPrice() {
      let matchedPrices = this.prices.filter(p => p.plan === this.plan && p.type === this.type && p.currency === 'usd')
      if (matchedPrices.length === 0) {
        console.error(`No price found for plan ${this.plan} and type ${this.type}`)
        return undefined
      } else  {
        return matchedPrices[0]
      }
    },
    cnyPrice() {
      let matchedPrices = this.prices.filter(p => p.plan === this.plan && p.type === this.type && p.currency === 'cny')
      if (matchedPrices.length === 0) {
        console.error(`No price found for plan ${this.plan} and type ${this.type}`)
        return undefined
      } else  {
        return matchedPrices[0]
      }
    },
    browserLanguage() {
      if (process.browser) {
        let code = navigator.language.replace(/-.*/, "");
        return code;
      }
      return "en";
    },
    stripeSuccessURL() {
      return this.$auth.user ? `${PYTHON_SERVER}stripe_checkout_success?user_id=${this.$auth.user.id}&host=${HOST}&session_id={CHECKOUT_SESSION_ID}` : undefined // Make sure we have the user's id
    }
  },
  data() {
    this.stripePublishableKey = "pk_live_9lnc7wrGHtcFdPKIWZdy9p17";

    return {
      stripeCancelURL: HOST + "/go-pro",
      productID: "prod_Lri8TEDq5YDfjb",
      prices: [
        {
          plan: 'lifetime', // monthly, annual, lifetime
          type: 'regular', // regular, sale, test
          mode: 'payment', // payment, subscription
          id: "price_1Muh8kG5EbMGvOafeKMCODAG",
          currency: "usd",
          amount: 119,
        },
        {
          plan: 'lifetime',
          type: 'regular',
          mode: 'payment',
          id: "price_1MuhBrG5EbMGvOafqwjKPV0I",
          currency: "cny",
          amount: 799,
          paymentLink: "https://buy.stripe.com/4gw03r5wD0Rd05GfZ3"
        },
        {
          plan: 'lifetime',
          type: 'test',
          mode: 'payment',
          id: "price_1MuhOYG5EbMGvOaf0CstpKKf",
          currency: "usd",
          amount: 0.52,
        },
        {
          plan: 'lifetime',
          type: 'test',
          mode: 'payment',
          id: "price_1MuhOtG5EbMGvOafztopdzqS",
          currency: "cny",
          amount: 3.02,
          paymentLink: "https://buy.stripe.com/dR63fD9MT57tdWw8wC"
        },
        {
          plan: 'annual',
          type: 'regular',
          mode: 'subscription',
          id: "price_1MuVSwG5EbMGvOafWG8aC89o",
          currency: "usd",
          amount: 59,
        },
        {
          plan: 'annual',
          type: 'regular',
          mode: 'payment', // not a re-occurring payment so it can work with Alipay and WeChat Pay
          id: "price_1MuhpjG5EbMGvOaf5NyI7JMT",
          currency: "cny",
          amount: 399,
          paymentLink: "https://buy.stripe.com/14kaI51gneI37y87sB",
        },
        {
          plan: 'annual',
          type: 'test',
          mode: 'subscription',
          id: "price_1MuhH3G5EbMGvOafQBDaBkmU",
          currency: "usd",
          amount: 0.51,
        },
        {
          plan: 'monthly',
          type: 'regular',
          mode: 'subscription',
          id: "price_1MuVVsG5EbMGvOafrx27nKxM",
          currency: "usd",
          amount: 6,
        },
        {
          plan: 'monthly',
          type: 'regular',
          mode: 'subscription',
          id: "price_1Muhw5G5EbMGvOafXWqu0m1l",
          currency: "cny",
          amount: 39,
          paymentLink: "https://buy.stripe.com/3cs6rPbV10Rdg4E14e"
        },
        {
          plan: 'monthly',
          type: 'test',
          mode: 'subscription',
          id: "price_1MuhF5G5EbMGvOaf0xv2sMRf",
          currency: "usd",
          amount: 0.50,
        },
      ]
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