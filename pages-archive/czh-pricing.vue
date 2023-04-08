<router>
  {
    path: '/:l1/:l2/czh-pricing/:currency?',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5">
      <div v-if="$l1.code === 'en' && $l2.code === 'zh'">
        <PricingEnZh :currency="currency" />
      </div>
      <div v-if="$l1.code === 'zh' && $l2.code === 'en'">
        <PricingZhEn :currency="currency" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    currency: {
      default: "USD",
    },
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
};
</script>

<style>
</style>
