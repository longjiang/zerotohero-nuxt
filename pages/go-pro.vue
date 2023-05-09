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
  <div
    :style="`min-height: 100vh; ${
      background
        ? 'background-image: url(' +
          background +
          '); background-size: cover; background-position: center;'
        : ''
    }`"
  >
    <div class="pt-5 pb-5 container">
      <div class="row">
        <div class="col-sm-12">
          <div v-if="type === 'sale'" class="bg-primary text-white p-3 rounded text-center mb-5" style="max-width: 46rem; margin: 0 auto; font-size: 1.2em" >
            <div><b>{{ $tb('VALENTINES DAY SALE!') }}</b> {{ $tb('50% off on lifetime Pro account upgrade') }}</div>
            <small style="text-small">{{ $t('Offer ends:')}} {{ $d(new Date(2023, 1, 14), 'short') }}</small>
          </div>
          <client-only>
            <div class="mt-4"></div>
            <FeatureComparison :type="type" />
            <div v-if="$auth.loggedIn && $auth.user" class="text-center text-white">
              <div v-if="pro">
                <h5 class="mb-3">🎉 {{ $tb('You are already Pro!') }} 🚀 {{ $tb('Enjoy!') }}</h5>
                <router-link class="btn btn-success mb-3" to="/">
                  {{ $tb('Start Using Pro') }}
                </router-link>
              </div>
              <div v-else class="mb-3 text-white">
                <client-only>
                  <div class="mt-5 mb-4">
                    <h5>{{ $tb('Ready to upgrade to Pro?') }}</h5>
                  </div>
                  <p>{{ $tb('Please choose your plan.') }}</p>
                  <Pricing @plan-selected="handlePlanSelection" />
                  <section class="mt-3" v-if="selectedPlan" id="payment-methods" ref="paymentMethods">
                    <div v-if="native">
                      <div class="pt-4 pb-5">
                        <PurchaseiOS :type="type" :test="TEST" :plan="selectedPlan.name" v-if="selectedPlan.name === 'lifetime'" />
                        <div v-else class="alert alert-warning" style="max-width: 15.5rem; margin: 0 auto;">⚠️ {{ $tb('Only the lifetime plan is available as an in-app purchase.') }}</div>
                      </div>
                    </div>
                    <div v-else>
                      <div>
                        <p>{{ $tb('Please choose your method of payment.') }}</p>
                        <PurchaseStripe  :type="type" :test="TEST" :plan="selectedPlan.name" />
                        <PurchasePayPal v-if="selectedPlan.name === 'lifetime'"  :type="type" :test="TEST" :plan="selectedPlan.name" />
                      </div>
                    </div>
                  </section>
                </client-only>
              </div>
            </div>
            <div v-else class="text-center text-white">
              <p style="font-size: 1.2em">
                {{ $tb('Before you get Pro, you need to create an account.') }}
              </p>
              <div>
                <router-link
                  :to="{ path: '/register?redirect=/go-pro' }"
                  class="btn btn-success mb-3"
                >
                  {{ $tb('Create an Account') }}
                  <i class="fas fa-chevron-right"></i>
                </router-link>
                <br />
                <router-link
                  :to="{ path: '/login?redirect=/go-pro' }"
                  class="text-white"
                >
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
import { timeout, background, TEST } from "@/lib/utils";

export default {
  data() {
    return {
      TEST,
      loading: false,
      type: 'regular',
      selectedPlan: undefined,
    };
  },
  computed: {
    background() {
      return background();
    },
    native() {
      return Capacitor.isNativePlatform();
    },
    pro() {
      return this.forcePro || this.$store.state.subscriptions.active;
    },
  },
  methods: {
    async handlePlanSelection(plan) {
      this.selectedPlan = plan;
      await timeout(1000)
      if (this.$refs.paymentMethods) this.$refs.paymentMethods.scrollIntoView({ behavior: 'smooth' });
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