<template>
  <div class="pricing-container">
    <div v-for="(plan, index) in pricingPlans" :key="index" :class="{
      'pricing-card': true,
      sale: SALE && plan.name === 'lifetime',
      active: subscription && subscription.type === plan.name && subscription.payment_customer_id,
      selected: selectedPlan && selectedPlan.name === plan.name,
    }" @click="subscription && subscription.type === plan.name ? null : selectPlan(plan)">
      <div class="price" style="white-space: nowrap">
        <div v-if="plan.name !== 'lifetime' || !SALE">
          <span>
            <span style="position: relative; bottom: 1.2rem">{{
      plan.currency
    }}</span>
            <b style="font-size: 2.68rem">{{ plan.amount }}</b></span>
          <span style="
              display: inline-block;
              position: relative;
              bottom: 1.2rem;
              margin-left: 0.1rem;
              text-align: left;
            "><span style="display: block; margin-bottom: 0px; line-height: 0.4">{{ $tb(plan.intervalText)
              }}</span></span>
        </div>
        <div v-else>
          <div v-if="plan.name === 'lifetime'" class="sale-banner">{{ $tb('{name} SALE!', { name: $tb(SALE_NAME) }) }}
          </div>
          <div style="margin-top: 1rem; margin-bottom: -0.5em">
            <span>
              <span style="
                  position: relative;
                  text-decoration: line-through;
                ">{{ plan.currency }}</span>
              <b style="text-decoration: line-through">{{
      plan.amount
    }}</b></span>
            <span style="
                display: inline-block;
                position: relative;
                margin-left: 0.1rem;
                text-align: left;
                text-decoration: line-through;
              ">
              <span style="display: block; margin-bottom: 0px; line-height: 0.4">{{ $tb(plan.intervalText) }}</span>
            </span>
          </div>
          <div>
            <span><span style="position: relative; bottom: 1.2rem; color: red">{{
      plan.currency
    }}</span><b style="font-size: 2.68rem; color: red">{{ Math.floor(plan.amount * SALE_DISCOUNT) }}</b></span><span style="
                display: inline-block;
                position: relative;
                bottom: 1.2rem;
                margin-left: 0.1rem;
                text-align: left;
              "><span style="
                  display: block;
                  margin-bottom: 0px;
                  line-height: 0.4;
                  color: red;
                ">{{ $tb(plan.intervalText) }}</span></span>
          </div>
        </div>
      </div>
      <div>{{ $tb(plan.description) }}</div>
      <div class="mt-2">
        <b-button v-if="plan.name === subscription?.type && subscription?.payment_customer_id" size="sm" disabled>{{
      $tb('Current Plan') }}</b-button>
        <b-button v-else-if="isHigherPlan(plan.name, subscription?.type)" size="sm" variant="success" @click="selectPlan(plan)">{{
          $tb('Select Plan') }}</b-button>
      </div>
      <div v-if=" plan.name === 'lifetime' && SALE " class="sale-end-date">
        <div>{{ $tb('Offer ends:')}} {{ $db(SALE_END_DATE, 'short') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { SALE, SALE_NAME, SALE_END_DATE, SALE_DISCOUNT } from "@/lib/utils/variables";

export default {
  data() {
    return {
      SALE,
      SALE_NAME,
      SALE_END_DATE,
      SALE_DISCOUNT,
      selectedPlan: null,
      pricingPlans: [
        {
          name: "monthly",
          currency: "US$",
          amount: "6",
          intervalText: "/mo",
          description: "Billed monthly",
        },
        {
          name: "annual",
          currency: "US$",
          amount: "59",
          intervalText: "/yr",
          description: "Billed annually",
        },
        {
          name: "lifetime",
          currency: "US$",
          amount: "129",
          intervalText: "/lifetime",
          description: "One-time payment, lifetime access.",
        },
      ],
    };
  },
  computed: {
    pro() {
      return this.$store.state.subscriptions.active;
    },
    subscription() {
      return this.$store.state.subscriptions.subscription;
    },
  },
  methods: {
    // Compare plan levels
    isHigherPlan(planNameA = 'free', planNameB = 'free') {
      // Define the ranking of plans
      const planRank = {
        'free': 0,
        'trial': 1,
        'monthly': 2,
        'annual': 3,
        'lifetime': 4
      };
      return planRank[planNameA] > planRank[planNameB];
    },
    selectPlan(plan) {
      this.selectedPlan = plan;
      this.$emit("plan-selected", plan);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";

.pricing-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.pricing-card {
  padding: 20px;
  margin: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  text-align: center;
  max-width: 200px;
  background: white;
  color: #666;
  cursor: pointer;
  border: 3px solid rgba($primary-color, 0);

  &:hover,
  &.selected {
    border: 3px solid $primary-color;
  }

  &.active {
    border: 3px solid #6c757d99;
    cursor: default;
  }
}

.sale-banner {
  background: red;
  color: white;
  width: 100%;
  padding: 2px 5px;
  font-weight: bold;
  white-space: initial;
}

.sale-end-date {
  color: red;
  font-size: 0.8em;
  margin-top: 10px;
}
</style>
