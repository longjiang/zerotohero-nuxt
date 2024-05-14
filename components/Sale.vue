<template>
  <div v-if="SALE" class="text-white p-3 rounded text-center sale-ad">
    <div><b>{{ $tb('{name} SALE!', { name: $tb(SALE_NAME) }) }}</b> {{ $tb('{discount} on lifetime Pro account',
    { discount: $tb('30% off') }) }}</div>
    <small style="text-small">{{ $tb('Offer ends:') }} {{ $db(SALE_END_DATE, 'short') }}</small>
    <!-- Action button directing to /go-pro -->
    <div class="mt-2" v-if="actionButton">
      <router-link to="/go-pro" class="btn btn-outline-light">{{ $tb('Upgrade to Lifetime & Save') }} <i
          class="fas fa-chevron-right"></i></router-link>
    </div>
  </div>
</template>
<script>
import { SALE, SALE_NAME, SALE_END_DATE } from "@/lib/utils";

export default {
  props: {
    actionButton: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      SALE,
      SALE_NAME,
      SALE_END_DATE,
    };
  },
};
</script>
<style>
.sale-ad {
  margin: 0 auto;
  font-size: 1.2em;
  background: red
}
</style>
