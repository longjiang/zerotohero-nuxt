<template>
  <div class="purchase-paypal">
    <div class="purchase-paypal-alerts">
      <div
        class="alert alert-success p-3 text-center"
        v-if="paypalPaymentStatus === 'success'"
      >
        <Loader
          :sticky="true"
          message="Payment successful, activating your Pro account..."
        />
      </div>
      <div
        class="alert alert-warning p-3 text-center"
        v-if="paypalPaymentStatus === 'cancelled'"
      >
        {{ $tb("It seems like you've cancelled the checkout, please try again.") }}
      </div>
      <div
        class="alert alert-warning p-3 text-center"
        v-if="paypalPaymentStatus === 'error'"
      >
        <p>
          {{ $tb("We're sorry, your payment didn't work this time, please try again.") }}
        </p>
        <p>
          {{ $tb('If you need further assistance, please contact support') }}: <a href="mailto:jon.long@zerotohero.ca">{{ $tb('Send us an email') }}</a>
        </p>
      </div>
    </div>
    <PayPal
      v-if="price"
      currency="USD"
      env="production"
      :amount="price"
      :client="paypalCredentials"
      :items="paypalItems"
      :experience="paypalExperienceOptions"
      :button-style="{
        shape: 'rect',
        size: 'medium',
        color: 'blue',
      }"
      @payment-authorized="onPayPalPaymentAuthorized"
      @payment-completed="onPayPalPaymentCompleted"
      @payment-cancelled="onPayPalPaymentCancelled"
    ></PayPal>
  </div>
</template>

<script>
import { PYTHON_SERVER, SALE } from "@/lib/utils";
import { HOST } from "@/lib/utils/url";
import { getPrices } from "@/lib/prices";

export default {
  data() {

    return {
      price: undefined, // Updated in created()
      paypalPaymentStatus: undefined,
      paypalCredentials: {
        sandbox:
          "AWBk2Jn-5v79iEBjPLYuRWo7OHgSL4YJKfjCcxX4nWQbLJa5F9D57PrVYAMOEa7Alm5WUdYRW_2KJBTH",  // ken-facilitator@chinesezerotohero.com
        production:
          "AcLhxqFEKaIXIRDdaHlKM6h2kUwtgnBdYtaBozJkFy1-hlCpIYytxePBmluj0xr9bYVUIGw6AFb17IgV",  // ken@chinesezerotohero.com
      },
      paypalItems: [
        {
          name: "zero-to-hero-pro",
          description: "Language Player Pro features",
          quantity: "1",
          price: undefined, // Updated in created()
          currency: "USD",
        },
      ],
      paypalExperienceOptions: {
        input_fields: {
          no_shipping: 1,
        },
      },
    }
  },
  computed: {
  },
  async created() {
    try {
      const allPlans = await getPrices()
      const lifetimeUSDPlan = allPlans.find(price => price.status === 'current' && price.type === SALE ? 'sale' : 'regular' && price.plan === 'lifetime' && price.currency === 'usd')
      this.price = lifetimeUSDPlan.amount.toString()
      this.paypalItems[0].price = lifetimeUSDPlan.amount.toString()
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    }
  },
  methods: {
    onPayPalPaymentAuthorized(e) {
      console.log({ paypalAuthorizedEvent: e });
    },
    onPayPalPaymentCompleted(e) {
      if (e.state == "approved") {
        // Payment successful
        this.paypalPaymentStatus = "approved";
        let paymentID = e.id;
        window.location = `${PYTHON_SERVER}paypal_checkout_success?pay_id=${paymentID}&user_id=${this.$auth.user.id}&host=${HOST}`;
      } else {
        this.paypalPaymentStatus = "error";
        // Payment unsuccessful
      }
    },
    onPayPalPaymentCancelled(e) {
      this.paypalPaymentStatus = "cancelled";
      console.log({ paypalCancelledEvent: e });
    },
  }
};
</script>

<style lang="scss" scoped>
.btn-purchase {
  display: block;
  width: 100%;
  margin: 0.25rem auto 0.25rem auto;
  text-align: left;
  width: 15rem;
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