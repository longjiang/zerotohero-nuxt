<template>
  <section v-if="selectedPlan" id="payment-methods" ref="paymentMethods">
    <div v-if="iOS">
      <div class="pt-4 pb-5">
        <div v-if="selectedPlan.name === 'lifetime'">
          <PurchaseiOS />
          <div v-if="SALE" class="alert alert-danger mt-2" style="max-width: 15.5rem; margin: 0 auto;">{{ $tb('Note: Discount price is not available through iOS in-app purchase.') }}</div>
        </div>
        <div v-else class="alert alert-warning" style="max-width: 15.5rem; margin: 0 auto;">⚠️ {{ $tb('Only the lifetime plan is available as an in -app purchase.') }}</div>
      </div>
    </div>
    <div v-else>
      <div>
        <p class="text-center">{{ $tb('Please choose your method of payment.') }}</p>
        <template v-if="$auth.user?.id">
          <PurchaseStripe :plan="selectedPlan.name" />
          <PurchasePayPal v-if="selectedPlan.name === 'lifetime'" :plan="selectedPlan.name" class="ml-2" />
        </template>
        <div v-else class="alert alert-warning">
          {{ $tb('Your account is not logged in. Please log in to purchase.') }} <a href="/login?redirect=/go-pro">{{
            $tb('Login') }}</a>
        </div>
      </div>
    </div>
  </section>
</template>
<script>
import { SALE } from "@/lib/utils/variables";

export default {
  props: {
    selectedPlan: Object,
  },
  data() {
    return {
      SALE,
    };
  },
  computed: {
    iOS() {
      return Capacitor.getPlatform() === "ios";
    },
  },
};
</script>