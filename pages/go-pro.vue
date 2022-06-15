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
              <div v-else class="mb-3">
                <div class="mb-3">Please choose your method of payment:</div>
                <div>
                  <stripe-checkout
                    ref="checkoutRef"
                    mode="payment"
                    :pk="publishableKey"
                    :line-items="stripeLineItems"
                    :success-url="successURL"
                    :cancel-url="cancelURL"
                    @loading="(v) => (loading = v)"
                  />
                  <b-button @click="submit" variant="success pl-3 pr-3" size="sm" style="position: relative; bottom: 0.5rem; padding: 0.1rem;">
                    <i class="fas fa-credit-card mr-1"></i> Credit Card
                  </b-button>
                  <PayPal
                      amount="0.50"
                      currency="USD"
                      :client="paypalCredentials"
                      :items="paypalItems"
                      :experience="paypalExperienceOptions"
                      :button-style="{
                        shape: 'rect',
                        size: 'responsive',
                        label: '',
                        color: 'gold',
                      }"
                      env="production"
                      class="d-inline-block"
                      @payment-authorized="onPayPalPaymentAuthorized"
                      @payment-completed="onPayPalPaymentCompleted"
                      @payment-cancelled="onPayPalPaymentCancelled"
                    ></PayPal>
                </div>
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
      paypalCredentials: {
        sandbox:
          "AU6fgxWMbyvtTHB-xv2WGb91HI21q9zkhG9IXthI62cCvasfpsO2DA5scSSx_r9R81r19J-yyexvd97A",
        production:
          "AeP7eWXUym5m7yGiNWAjV7hEgeS42FhEbU0l24UaqVa-8PgJf0L_OlQwTGHZXGOeVMkxs4l5-TSKc8xu",
      },
      paypalItems: [
        {
          name: "zero-to-hero-pro",
          description: "Zero to Hero Pro features",
          quantity: "1",
          price: "0.50",
          currency: "USD",
        },
      ],
      paypalExperienceOptions: {
        input_fields: {
          no_shipping: 1,
        },
      },
      stripeLineItems: [
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
    onPayPalPaymentAuthorized(e) {
      // {
      //   "intent": "sale",
      //   "orderID": "EC-7A438886YD7979014",
      //   "payerID": "EACR8MEZXSQPN",
      //   "paymentID": "PAYID-MKUWKFQ71N57282RA848534U",
      //   "paymentToken": "EC-7A438886YD7979014",
      //   "returnUrl": "https://www.paypal.com/checkoutnow/error?paymentId=PAYID-MKUWKFQ71N57282RA848534U&token=EC-7A438886YD7979014&PayerID=EACR8MEZXSQPN",
      //   "button_version": "4.0.37"
      // }
      console.log({paypalAuthorizedEvent: e})
    },
    onPayPalPaymentCompleted(e) {
      // Example of failed return event:
      // {
      //   "intent": "sale",
      //   "orderID": "EC-7A438886YD7979014",
      //   "payerID": "EACR8MEZXSQPN",
      //   "paymentID": "PAYID-MKUWKFQ71N57282RA848534U",
      //   "paymentToken": "EC-7A438886YD7979014",
      //   "returnUrl": "https://www.paypal.com/checkoutnow/error?paymentId=PAYID-MKUWKFQ71N57282RA848534U&token=EC-7A438886YD7979014&PayerID=EACR8MEZXSQPN",
      //   "button_version": "4.0.37"
      // }

      // Example of successful return event
      // {
      //     "id": "PAYID-MKUWOHA0VA868519Y941683S",
      //     "intent": "sale",
      //     "state": "approved",
      //     "cart": "31M3697021347521V",
      //     "create_time": "2022-06-15T04:59:08Z",
      //     "payer": {
      //         "payment_method": "paypal",
      //         "status": "VERIFIED",
      //         "payer_info": {
      //             "email": "jianglong@me.com",
      //             "first_name": "Jiang",
      //             "middle_name": "Jiang",
      //             "last_name": "Long",
      //             "payer_id": "CS8T74VURZALQ",
      //             "country_code": "CA"
      //         }
      //     },
      //     "transactions": [
      //         {
      //             "amount": {
      //                 "total": "0.50",
      //                 "currency": "USD",
      //                 "details": {
      //                     "subtotal": "0.50",
      //                     "shipping": "0.00",
      //                     "handling_fee": "0.00",
      //                     "insurance": "0.00",
      //                     "shipping_discount": "0.00"
      //                 }
      //             },
      //             "item_list": {
      //                 "items": [
      //                     {
      //                         "name": "zero-to-hero-pro",
      //                         "price": "0.50",
      //                         "currency": "USD",
      //                         "quantity": 1,
      //                         "description": "Zero to Hero Pro features",
      //                         "tax": "0.00"
      //                     }
      //                 ]
      //             },
      //             "related_resources": [
      //                 {
      //                     "sale": {
      //                         "id": "9T618036YK2139359",
      //                         "state": "pending",
      //                         "payment_mode": "ECHECK",
      //                         "protection_eligibility": "INELIGIBLE",
      //                         "parent_payment": "PAYID-MKUWOHA0VA868519Y941683S",
      //                         "create_time": "2022-06-15T04:59:47Z",
      //                         "update_time": "2022-06-15T04:59:47Z",
      //                         "reason_code": "ECHECK",
      //                         "amount": {
      //                             "total": "0.50",
      //                             "currency": "USD",
      //                             "details": {
      //                                 "subtotal": "0.50",
      //                                 "shipping": "0.00",
      //                                 "handling_fee": "0.00",
      //                                 "insurance": "0.00",
      //                                 "shipping_discount": "0.00"
      //                             }
      //                         }
      //                     }
      //                 }
      //             ]
      //         }
      //     ]
      // }
      if (e.state == 'approved') {
        // Payment successful
        let paymentID = e.id
        window.location = `https://python.zerotohero.ca/paypal_checkout_success?pay_id=${paymentID}&user_id=${this.$auth.user.id}&host=${HOST}`
      } else {
        // Payment unsuccessful
      }
    },
    onPayPalPaymentCancelled(e) {
      console.log({paypalCancelledEvent: e})
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