<router>
  {
    path: '/go-pro',
    props: true
  }
</router>
<template>
  <div class="main container mt-5">
    <stripe-checkout
      ref="checkoutRef"
      mode="payment"
      :pk="publishableKey"
      :line-items="lineItems"
      :success-url="successURL"
      :cancel-url="cancelURL"
      @loading="v => loading = v"
    />
    <button @click="submit">Pay now!</button>
  </div>
</template>

<script>
import { HOST } from '@/lib/utils/url'

export default {
  data () {
    this.publishableKey = 'pk_live_9lnc7wrGHtcFdPKIWZdy9p17';
    return {
      loading: false,
      lineItems: [
        {
          price: 'price_1L9yi0G5EbMGvOafLzk17HYw', // The id of the one-time price you created in your Stripe dashboard
          quantity: 1,
        },
      ],
      successURL: HOST + '/go-pro-success',
      cancelURL: HOST + '/go-pro-cancel',
    };
  },
  methods: {
    submit () {
      // You will be redirected to Stripe's secure checkout page
      this.$refs.checkoutRef.redirectToCheckout();
    },
  },
};
</script>