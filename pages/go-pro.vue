<router>
  {
    path: '/go-pro',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div :style="`min-height: 100vh; ${background
      ? 'background-image: url(' +
      background +
      '); background-size: cover; background-position: center;'
      : ''
    }`">
    <div class="pt-5 pb-5 container">
      <div class="row">
        <div class="col-sm-12">
          <Sale class="mb-5" :actionButton="false" />
          <client-only>
            <div class="mt-4"></div>
            <FeatureComparison />
            <div v-if="$auth.loggedIn && $auth.user" class="text-center text-white">
              <div class="mb-3 text-white">
                <client-only>
                  <div class="mt-5 mb-4">
                    <h5>{{ $tb('Ready to upgrade?') }}</h5>
                  </div>
                  <p>{{ $tb('Please choose your plan.') }}</p>
                  <Pricing @plan-selected="handlePlanSelection" />
                  <b-modal ref="paymentMethods" hide-footer centered class="safe-padding-top mt-4" size="sm" :title="selectedPlan ? selectedPlan.currency + Math.floor(selectedPlan.amount * (selectedPlan.name === 'lifetime' && SALE ? SALE_DISCOUNT : 1)) + $tb(selectedPlan.intervalText) : 'Pro'"
                    @shown="modalRendered = true" @hidden="modalRendered = false" >
                    <div v-if="modalRendered"><!-- We load this only after the modal is shown to prevent PayPal button errors -->
                      <!-- If there is an active subscription, the customer must cancel it first. -->
                      <div v-if="hasActiveSubscription">
                        <p>{{ $tb('You have an existing active subscription:') }}</p>
                        <SubscriptionStatus class="my-3" :showActionButtons="false" />
                        <p><strong>{{ $tb('You must cancel it before you can upgrade.') }}</strong></p>
                        <CancelSubscriptionButton :subscription="subscription" variant="success" class="w-100" :text="$tb('Cancel Existing Subscription')" />
                      </div>
                      <PaymentMethods v-else :selectedPlan="selectedPlan" /> 
                    </div>
                  </b-modal>
                </client-only>
              </div>
            </div>
            <div v-else class="text-center text-white">
              <Pricing class="mb-5" />
              <p style="font-size: 1.2em;">
                {{ $tb('Before you get Pro, you need to create an account.') }}
              </p>
              <div>
                <router-link :to="{ path: '/register?redirect=/go-pro' }" class="btn btn-success mb-3">
                  {{ $tb('Create an Account') }}
                  <i class="fas fa-chevron-right"></i>
                </router-link>
                <br />
                <router-link :to="{ path: '/login?redirect=/go-pro' }" class="text-white">
                  {{ $tb('Already have an account?') }}
                  <u>{{ $tb('Please login') }}</u>
                </router-link>
              </div>
            </div>
          </client-only>
          <div class="text-center text-white" v-if="!native">
            {{ $tb('If you have any questions or issues, please contact us.') }}
            <a href="mailto:jon.long@zerotohero.ca" class="text-white"><u>{{ $tb('Send us an email') }}</u></a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Capacitor } from "@capacitor/core";
import { background, SALE, SALE_DISCOUNT } from "@/lib/utils";

export default {
  data() {
    return {
      SALE,
      SALE_DISCOUNT,
      loading: false,
      selectedPlan: undefined,
      modalRendered: false,
    };
  },
  computed: {
    background() {
      return background();
    },
    native() {
      return Capacitor.isNativePlatform();
    },
    subscription() {
      return this.$store.state.subscriptions.subscription;
    },
    pro() {
      return this.forcePro || this.$store.state.subscriptions.active;
    },
    hasActiveNonTrialSubscription() {
      if (!this.subscription) return false;
      if (!this.subscription.payment_customer_id) return false; // Only those with a payment_customer_id have a renewing subscription with Stripe
      if (this.subscription.type === 'trial') return false; // If this is a trial subscription (such in the case where an existing customer with an expired subscription got a free trial) 
      // Make sure subscription is active and not expired
      const expiresOn = new Date(this.subscription.expires_on.replace(' ', 'T')); // subscription.expires_on is in the format 2024-06-14 10:16:40, but we need a Date object for comparison
      const currentDate = new Date();
      return currentDate < expiresOn;
    },
  },
  methods: {
    async handlePlanSelection(plan) {
      this.selectedPlan = plan;
      // Show the payment methods modal
      this.$refs.paymentMethods.show();
    },
    initPaymentMethods() {

      paypal.Buttons({
        // Configuration options
        createOrder: function (data, actions) {
          // Order creation code
        },
        onApprove: function (data, actions) {
          // Code to run on approval
        }
      }).render('#paypal-button-container');
    },
  },
};
</script>
<style scoped lang="scss">
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