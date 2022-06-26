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
                      @click="executeiOSInAppPurchase"
                    >
                      <i class="fab fa-apple mr-1"></i>
                      Pay with In-App Purchase
                    </b-button>
                    <div class="mt-3">
                      <u
                        class="text-secondary"
                        @click="restoreiOSInAppPurchase"
                      >
                        Restore Purchase
                      </u>
                    </div>
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
import { InAppPurchase2 } from "@ionic-native/in-app-purchase-2";
import axios from "axios";
import logError from "@/lib/utils/error";

const IOS_IAP_PRODUCT_ID = "pro";

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
  mounted() {
    // this.registeriOSInAppPurchaseProducts();
    // this.setupiOSInAppPurchaseListeners();
    this.elevateiOSUserToPro('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')
  },
  beforeDestroy() {
    InAppPurchase2.off(this.oniOSProductApproved);
    InAppPurchase2.off(this.oniOSProductVerified);
    InAppPurchase2.off(this.oniOSProductOrder);
    InAppPurchase2.off(this.oniOSProductOrderErr);
  },
  methods: {
    registeriOSInAppPurchaseProducts() {
      InAppPurchase2.register([
        { id: IOS_IAP_PRODUCT_ID, type: InAppPurchase2.NON_CONSUMABLE },
      ]);
      InAppPurchase2.refresh();
    },
    oniOSProductApproved(product) {
      // synchronous
      console.log("approved");
      return product.verify();
    },
    async elevateiOSUserToPro(receipt) {
      let url = `http://127.0.0.1:5000/in_app_purchase_success`
      let body = { user_id: this.$auth.user.id, receipt}
      try {
        let res = await axios.post(url, body)
        console.log({res})
        let data = res.data
        console.log({data})
      } catch(err) {
        logError(err)
      }
    },
    async oniOSProductVerified(product) {
      console.log("verified");
      // let receipt = product?.transaction?.appStoreReceipt
      // if (receipt) {
      // }
      product.finish();
    },
    oniOSProductOrder(product) {
      // Purchase in progress!
      console.log("order");
    },
    oniOSProductOrderErr(err) {
      this.$toast.error(`Failed to purchase: ${err}`, { duration: 5000 });
    },
    setupiOSInAppPurchaseListeners() {
      InAppPurchase2.when(IOS_IAP_PRODUCT_ID)
        .approved(this.oniOSProductApproved)
        .verified(this.oniOSProductVerified);
    },
    restoreiOSInAppPurchase() {
      InAppPurchase2.refresh();
    },
    executeiOSInAppPurchase() {
      InAppPurchase2.order(IOS_IAP_PRODUCT_ID).then(
        this.oniOSProductOrder,
        this.oniOSProductOrderError
      );
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