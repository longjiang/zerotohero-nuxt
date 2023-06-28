<template>
  <div class="pricing-container">
    <div
      v-for="(plan, index) in pricingPlans"
      :key="index"
      :class="{
        'pricing-card': true,
        sale: SALE && plan.name === 'lifetime',
        selected: selectedPlan && selectedPlan.name === plan.name,
      }"
      @click="selectPlan(plan)"
    >
      <div class="price" style="white-space: nowrap">
        <div v-if="plan.name !== 'lifetime' || !SALE">
          <span>
            <span style="position: relative; bottom: 1.2rem">{{
              plan.currency
            }}</span>
            <b style="font-size: 2.68rem">{{ plan.amount }}</b></span>
          <span
            style="
              display: inline-block;
              position: relative;
              bottom: 1.2rem;
              margin-left: 0.1rem;
              text-align: left;
            "
            ><span
              style="display: block; margin-bottom: 0px; line-height: 0.4"
              >{{ $tb(plan.intervalText) }}</span
            ></span
          >
        </div>
        <div v-else>
          <div v-if="plan.name === 'lifetime'" class="sale-banner">{{ $tb('{name} SALE!', {name: $tb('SUMMER')}) }}</div>
          <div style="margin-top: 1rem; margin-bottom: -0.5em">
            <span>
              <span
                style="
                  position: relative;
                  text-decoration: line-through;
                "
                >{{ plan.currency }}</span
              >
              <b style="text-decoration: line-through">{{
                plan.amount
              }}</b></span
            >
            <span
              style="
                display: inline-block;
                position: relative;
                margin-left: 0.1rem;
                text-align: left;
                text-decoration: line-through;
              "
            >
              <span
                style="display: block; margin-bottom: 0px; line-height: 0.4"
                >{{ $tb(plan.intervalText) }}</span
              >
            </span>
          </div>
          <div>
            <span
              ><span style="position: relative; bottom: 1.2rem; color: red">{{
                plan.currency
              }}</span
              ><b style="font-size: 2.68rem; color: red">83</b></span
            ><span
              style="
                display: inline-block;
                position: relative;
                bottom: 1.2rem;
                margin-left: 0.1rem;
                text-align: left;
              "
              ><span
                style="
                  display: block;
                  margin-bottom: 0px;
                  line-height: 0.4;
                  color: red;
                "
                >{{ $tb(plan.intervalText) }}</span
              ></span
            >
          </div>
        </div>
      </div>
      <div>{{ $tb(plan.description) }}</div>
      <div v-if="plan.name === 'lifetime' && SALE" class="sale-end-date">
        <div>{{ $tb('Offer ends:')}} {{ $db(new Date(2023, 6, 5), 'short') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { SALE } from "@/lib/utils/variables";

export default {
  data() {
    return {
      SALE,
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
        // Legacy
        // {
        //   name: "lifetime",
        //   currency: "US$",
        //   amount: "119",
        //   intervalText: "/lifetime",
        //   description: "One-time payment, lifetime access.",
        // },
        // New pricing will come into effect on 2021-10-01
        {
          name: "lifetime",
          currency: "US$",
          amount: "119",
          intervalText: "/lifetime",
          description: "One-time payment, lifetime access.",
        },
      ],
    };
  },
  computed: {},
  methods: {
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
}

.sale-banner {
  background: red;
  color: white;
  width: 100%;
  padding: 2px 5px;
  font-weight: bold;
}

.sale-end-date {
  color: red;
  font-size: 0.8em;
  margin-top: 10px;
}
</style>
