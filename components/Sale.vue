<template>
  <transition name="fade-scale" mode="out-in">
    <div v-if="SALE && ready && (!subscription || subscription.type !== 'lifetime')" class="text-white p-3 rounded text-center sale-ad" v-cloak>
      <div><b>{{ $tb('{name} SALE!', { name: $tb(SALE_NAME) }) }}</b> {{ $tb('{discount} on lifetime Pro account', { discount: $tb(`${Math.round((1 - SALE_DISCOUNT) * 100)}% off`) }) }}</div>
      <small>{{ $tb('Offer ends:') }} {{ $db(SALE_END_DATE, 'short') }}</small>
      <div class="mt-2" v-if="actionButton">
        <router-link to="/go-pro" class="btn btn-outline-light">{{ $tb('Upgrade to Lifetime & Save') }} <i class="fas fa-chevron-right"></i></router-link>
      </div>
    </div>
  </transition>
</template>

<script>
import { SALE, SALE_NAME, SALE_END_DATE, SALE_DISCOUNT } from "@/lib/utils";

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
      SALE_DISCOUNT,
      ready: false, // Ensure data is loaded
    };
  },
  computed: {
    subscription() {
      return this.$store.state.subscriptions.subscription;
    },
  },
  mounted() {
    this.checkSubscription();
  },
  methods: {
    async checkSubscription() {
      // Ensure data is loaded
      await this.$store.dispatch('subscriptions/checkSubscription');
      this.$nextTick(() => {
        this.ready = true; // Set ready to true to allow transition
      });
    },
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
