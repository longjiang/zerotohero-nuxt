<template>
  <div>
    <strike v-if="price.salePrice">{{ price.price }}</strike>
    <b v-else>{{ price.price }}</b>
    <br v-if="!compact" />
    <span class="sale-price" v-if="price.salePrice">
      <span v-if="!compact">SALE:</span>
      <b>{{ price.salePrice }}</b>
    </span>
    <div style="color: rgb(26, 148, 6); font-size: 12px" v-if="save && !price.salePrice">
      Save {{ save }} over individual courses.
    </div>
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
    save: {
      type: String
    }
  },
};
</script>

<style lang="scss" scoped>
.sale-price {
  color: green;
}
</style>