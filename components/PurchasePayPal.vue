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
import { PYTHON_SERVER } from "@/lib/utils/servers";
import { HOST } from "@/lib/utils/url";

export default {
  props: {
    sale: {
      default: false
    }
  },
  data() {
    // Legacy Pricing
    // let defaultPrice = "89.00"
    // let discountPrice = "44.50"
    // New pricing in effect on 2023-04-10
    let defaultPrice = "119.00"
    let discountPrice = "59.50"
    let price = this.sale ? discountPrice : defaultPrice
    return {
      price,
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
          price,
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
  methods: {
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
      //                         "description": "Language Player Pro features",
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