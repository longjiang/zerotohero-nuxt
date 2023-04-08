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
      <h3>{{ plan.priceText }}</h3>
      <div>{{ plan.description }}</div>
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
          name: 'monthly',
          priceText: '$6/mo',
          description: 'Billed monthly',
        },
        {
          name: 'annual',
          priceText: '$59/yr',
          description: 'Billed annually',
        },
        {
          name: 'lifetime',
          priceText: '$119',
          description: 'One-time payment, lifetime access.',
        },
      ],
    };
  },
  methods: {
    selectPlan(plan) {
      this.selectedPlan = plan;
      this.$emit('plan-selected', plan);
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