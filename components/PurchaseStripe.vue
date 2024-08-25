<template>
  <div class="purchase-stripe" v-if="prices?.length">
    <!-- If there are USD prices, show the Credit Card button -->
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
        :client-reference-id="this.$auth.user && this.$auth.user.id && this.$auth.user.id.toString()"
        @loading="(v) => (loading = v)"
      />
      <b-button @click="submitStripeUSD" variant="success btn-purchase" size="md">
        <span class="icons">
          <i class="fas fa-credit-card"></i>
          <i class="fab fa-cc-apple-pay"></i>
          <i class="fab fa-google-pay mr-1"></i>
        </span>
        {{ $tb('Credit Card') }}
        <i class="fa-solid fa-chevron-right ml-1"></i>
      </b-button>
    </template>
    <!-- If there are CNY prices, show the Alipay and WeChat Pay buttons -->
    <template v-if="cnyPrice">
      <a :href="cnyPrice.paymentLink + `?client_reference_id=${this.$auth.user.id}`" class="btn btn-success btn-purchase">
        <span class="icons"><i class="fab fa-weixin"></i></span>
        {{ $tb("WeChat Pay") }}
        <i class="fa-solid fa-chevron-right ml-1"></i>
      </a>
      <a :href="cnyPrice.paymentLink + `?client_reference_id=${this.$auth.user.id}`" class="btn btn-success btn-purchase">
        <span class="icons"><i class="fab fa-alipay"></i></span>
        {{ $tb("Alipay") }}
        <i class="fa-solid fa-chevron-right ml-1"></i>
      </a>
    </template>
  </div>
</template>

<script>
import { PYTHON_SERVER, SALE, TEST } from "../lib/utils";
import { HOST } from "../lib/utils/url";
import { getPrices } from "../lib/prices";

export default {
  props: {
    plan: {
      default: 'lifetime'
    },
  },
  data() {
    return {
      TEST,
      type: SALE && this.plan === 'lifetime' ? 'sale' : 'regular', // or 'sale'
      stripePublishableKey: TEST ? "pk_test_kjsYSddsuYbdHnea22KggNe4" : "pk_live_9lnc7wrGHtcFdPKIWZdy9p17",
      stripeCancelURL: HOST + "/go-pro",
      productID: TEST ? "prod_NgFwoKIzOmLCA3" : "prod_Lri8TEDq5YDfjb",
      prices: [],
    };
  },
  async created() {
    try {
      this.prices = await getPrices()
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    }
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
    stripeSuccessURL() {
      return this.$auth.user?.id ? `${PYTHON_SERVER}stripe_checkout_success?user_id=${this.$auth.user.id}&host=${HOST}&session_id={CHECKOUT_SESSION_ID}` : undefined // Make sure we have the user's id
    }
  },
  methods: {
    submitStripeUSD() {
      // You will be redirected to Stripe's secure checkout page
      this.$refs.stripeCheckoutUSDRef.redirectToCheckout();
    },
    submitStripeCNY() {
      // You will be redirected to Stripe's secure checkout page
      this.$refs.stripeCheckoutCNYRef.redirectToCheckout();
    }
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