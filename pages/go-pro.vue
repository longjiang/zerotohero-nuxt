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
            <div class="text-seoncdary bg-white p-3 rounded">
              <h5 class="text-center">Pro users can</h5>
              <ul class="list-unstyled">
                <li>
                  <i class="fas fa-check-circle text-success"></i>
                  See full transcripts of videos
                </li>
                <li>
                  <i class="fas fa-check-circle text-success"></i>
                  See all video search results from the dictionary
                </li>
                <li>
                  <i class="fas fa-check-circle text-success"></i>
                  Have access to an
                  <em><b>ocean</b></em>
                  of language-learning material
                </li>
              </ul>
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
              <div v-if="![1, 4].includes(Number($auth.user.role))">
                <div class="text-center bg-white rounded p-3">
                  <div class="user-avatar"><i class="fas fa-user"></i></div>
                  <h6>
                    {{ $auth.user.first_name }} {{ $auth.user.last_name }}
                  </h6>
                  <div>{{ $auth.user.email }}</div>
                </div>
                <div class="mt-4"></div>
                <p>Let's get make you Pro.</p>
              </div>
              <div class="mt-3"></div>
              <div v-if="[1, 4].includes(Number($auth.user.role))">
                <h5 class="mb-3">🎉 You are already Pro! 🚀 Enjoy!</h5>
                <router-link class="btn btn-primary mb-3" to="/">
                  Start Using Pro
                </router-link>
              </div>
              <div v-else class="mb-3">
                <div
                  class="alert alert-success p-3 text-center"
                  v-if="paymentStatus === 'success'"
                >
                  <Loader
                    :sticky="true"
                    message="Payment successful, activating your Pro account..."
                  />
                </div>
                <div
                  class="alert alert-warning p-3 text-center"
                  v-if="paymentStatus === 'cancelled'"
                >
                  It seems like you've cancelled the checkout, please try again.
                </div>
                <div
                  class="alert alert-warning p-3 text-center"
                  v-if="paymentStatus === 'error'"
                >
                  <p>
                    We're sorry, your payment didn't work this time, please try
                    again.
                  </p>
                  <p>
                    If you need further assistance, please contact support by
                    <a href="mailto:jon@chinesezerotohero.com">email</a>
                    .
                  </p>
                </div>
                <div>
                  <div class="pl-5">
                    <sup style="font-size: 1rem">$</sup>
                    <span style="font-size: 2.2rem; font-weight: bold">89</span>
                    <sup style="font-size: 1rem">/ lifetime</sup>
                  </div>
                </div>
                <div v-if="native">
                  <div class="mt-3 mb-4">
                    <b-button
                      size="sm"
                      variant="success"
                      @click="inAppPurchase"
                    >
                      <i class="fab fa-apple mr-1"></i>
                      Pay with In-App Purchase
                    </b-button>
                  </div>
                </div>
                <div v-else>
                  <div class="mt-3 mb-4">
                    Please choose your method of payment:
                  </div>
                  <div>
                    <stripe-checkout
                      ref="stripeCheckoutUSDRef"
                      mode="payment"
                      :pk="publishableKey"
                      :line-items="[
                        {
                          price: 'price_1LArBtG5EbMGvOaflIKUthub', // USD price for all other payment methods
                          quantity: 1,
                        },
                      ]"
                      :success-url="successURL"
                      :cancel-url="cancelURL"
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
                    <PayPal
                      amount="89.00"
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
import { Capacitor } from "@capacitor/core";
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2'

export default {
  data() {
    this.publishableKey = "pk_live_9lnc7wrGHtcFdPKIWZdy9p17";
    return {
      loading: false,
      paymentStatus: undefined,
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
          price: "89.00",
          currency: "USD",
        },
      ],
      paypalExperienceOptions: {
        input_fields: {
          no_shipping: 1,
        },
      },
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
    native() {
      return Capacitor.isNativePlatform();
    },
  },
  methods: {
    inAppPurchase() {
      InAppPurchase2.register([{id: 'pro', type: InAppPurchase2.NON_CONSUMABLE}])
      InAppPurchase2.when("pro").approved(function(product){
          // synchronous
          console.log({product})
          product.finish();
      });
    },
    submitStripeUSD() {
      // You will be redirected to Stripe's secure checkout page
      this.$refs.stripeCheckoutUSDRef.redirectToCheckout();
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
      console.log({ paypalAuthorizedEvent: e });
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
      if (e.state == "approved") {
        // Payment successful
        this.paymentStatus = "approved";
        let paymentID = e.id;
        window.location = `https://python.zerotohero.ca/paypal_checkout_success?pay_id=${paymentID}&user_id=${this.$auth.user.id}&host=${HOST}`;
      } else {
        this.paymentStatus = "error";
        // Payment unsuccessful
      }
    },
    onPayPalPaymentCancelled(e) {
      this.paymentStatus = "cancelled";
      console.log({ paypalCancelledEvent: e });
    },
  },
};
</script>
<style scoped lang="scss">
.bg {
  min-height: 100vh;
  color: rgb(40, 40, 40);
}
.logo {
  margin-top: -5.5rem;
}
.go-pro-wrapper {
  margin-top: 5rem;
  margin-bottom: 5rem;
  max-width: 30rem;
  padding: 2rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.7333333333);
  box-shadow: 0 0 30px rgb(0 0 0 / 48%);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
}

.user-avatar {
  background-color: #fd5f22;
  color: white;
  border-radius: 100%;
  height: 3rem;
  width: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  i {
    font-size: 1.5rem;
  }
}
</style>