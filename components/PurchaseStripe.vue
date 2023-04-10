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
      default: 'regular' // or 'sale'
    },
    test: {
      default: false
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
    return {
      stripePublishableKey: this.test ? "pk_test_kjsYSddsuYbdHnea22KggNe4" : "pk_live_9lnc7wrGHtcFdPKIWZdy9p17",
      stripeCancelURL: HOST + "/go-pro",
      productID: this.test ? "prod_NgFwoKIzOmLCA3" : "prod_Lri8TEDq5YDfjb",
      prices: [
        // Legacy pricing
        // {
        //   plan: 'lifetime', // monthly, annual, lifetime
        //   type: 'regular', // regular, sale, test
        //   mode: 'payment', // payment, subscription
        //   id: this.test ? "price_1MutQRG5EbMGvOafQPHpDuQt" : "price_1LArBtG5EbMGvOaflIKUthub",
        //   currency: "usd",
        //   amount: 89,
        // },
        // {
        //   plan: 'lifetime',
        //   type: 'regular',
        //   mode: 'payment',
        //   id: this.test ? "price_1MutQRG5EbMGvOafyMTUX7xk" : "price_1LAr9NG5EbMGvOafz1UBoihK",
        //   currency: "cny",
        //   amount: 598,
        //   paymentLink: "https://buy.stripe.com/4gw2bz7ELbvR8CccMN"
        // },
        // New in effect on 2021-10-01
        {
          plan: 'lifetime', // monthly, annual, lifetime
          type: 'regular', // regular, sale, test
          mode: 'payment', // payment, subscription
          id: this.test ? "price_1MutQQG5EbMGvOaf9gV6n0mF" : "price_1Muh8kG5EbMGvOafeKMCODAG",
          currency: "usd",
          amount: 119,
        },
        {
          plan: 'lifetime',
          type: 'regular',
          mode: 'payment',
          id: this.test ? "price_1MutQQG5EbMGvOafjVE35Ozh" : "price_1MuhBrG5EbMGvOafqwjKPV0I",
          currency: "cny",
          amount: 799,
          paymentLink: this.test ? "https://buy.stripe.com/test_5kAdRk6XretR6Y05kk" : "https://buy.stripe.com/4gw03r5wD0Rd05GfZ3"
        },
        {
          plan: 'annual',
          type: 'regular',
          mode: 'subscription',
          id: this.test ? "price_1MutQRG5EbMGvOafgfJaciGg" : "price_1MuVSwG5EbMGvOafWG8aC89o",
          currency: "usd",
          amount: 59,
        },
        {
          plan: 'annual',
          type: 'regular',
          mode: 'payment', // not a re-occurring payment so it can work with Alipay and WeChat Pay
          id: this.test ? "price_1MutQPG5EbMGvOaf3ekfgqMv" : "price_1MuhpjG5EbMGvOaf5NyI7JMT",
          currency: "cny",
          amount: 399,
          paymentLink: this.test ? "https://buy.stripe.com/test_dR614ygy10D19685kl" : "https://buy.stripe.com/14kaI51gneI37y87sB",
        },
        {
          plan: 'monthly',
          type: 'regular',
          mode: 'subscription',
          id: this.test ? "price_1MutQQG5EbMGvOafqPRQ6fuJ" : "price_1MuVVsG5EbMGvOafrx27nKxM",
          currency: "usd",
          amount: 6,
        },
        {
          plan: 'monthly',
          type: 'regular',
          mode: 'subscription',
          id: this.test ? "price_1MutQPG5EbMGvOafheA9KTCi" : "price_1Muhw5G5EbMGvOafXWqu0m1l",
          currency: "cny",
          amount: 39,
          paymentLink: this.test ? "https://buy.stripe.com/test_aEUfZsepT0D1aac3ce" : "https://buy.stripe.com/3cs6rPbV10Rdg4E14e"
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