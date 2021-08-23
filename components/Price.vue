<template>
  <div>
    <strike>{{ price.price }}</strike>
    <br v-if="!compact" />
    <span class="sale-price" v-if="price.salePrice">
      <span v-if="!compact">SALE:</span>
      <b>{{ price.salePrice }}</b>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    price: {
      type: Object,
    },
    compact: {
      default: false,
    },
  },
};
</script>

<style>
</style>