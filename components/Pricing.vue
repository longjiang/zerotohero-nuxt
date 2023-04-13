<template>
  <div class="pricing-container">
    <div
      v-for="(plan, index) in pricingPlans"
      :key="index"
      :class="{
        'pricing-card': true,
        selected: selectedPlan && selectedPlan.name === plan.name,
      }"
      @click="selectPlan(plan)"
    >
      <div class="price" style="white-space: nowrap">
        <span
          ><span style="position: relative; bottom: 1.2rem">{{
            plan.currency
          }}</span>
          <b style="font-size: 2.68rem">{{ plan.amount }}</b></span
        >
        <span
          style="
            display: inline-block;
            position: relative;
            bottom: 1.2rem;
            margin-left: 0.1rem;
            text-align: left;
          "
          ><span style="display: block; margin-bottom: 0px; line-height: 0.4">
            {{ $tb(plan.intervalText) }}
          </span>
        </span>
      </div>
      <div>{{ $tb(plan.description) }}</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
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
  computed: {
  },
  methods: {
    selectPlan(plan) {
      this.selectedPlan = plan;
      this.$emit("plan-selected", plan);
    },
  },
};
</script>

<style lang="scss" scoped>
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
  // add a matching green border when the card is hovered
  border: 3px solid #28a74500;
  &:hover,
  &.selected {
    border: 3px solid #28a745;
  }
}
</style>
