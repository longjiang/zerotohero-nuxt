<template>
  <b-button @click="cancelSubscriptionAtEndOfPeriod" :variant="variant" :size="size" :class="{
    'p-0 mb-1 text-danger': variant === 'link'
  }" :disabled="cancelling">
    <b-spinner small v-if="cancelling" />
    <span :class="{ 'text-decoration-underline': variant === 'link' }" v-else>{{ $t(text) }}</span>
  </b-button>
</template>

<script>
export default {
  data() {
    return {
      cancelling: false,
    };
  },
  props: {
    variant: {
      type: String,
      default: 'danger',
    },
    size: {
      type: String,
      default: 'small',
    },
    subscription: {
      type: Object,
      required: true,
    },
    text: {
      type: String,
      default: 'Cancel',
    },
  },
  methods: {
    async cancelSubscriptionAtEndOfPeriod() {
      // Prompt the user to confirm the cancellation
      if (!confirm(this.$t('Are you sure you want to cancel your Pro subscription?'))) {
        return;
      }
      this.cancelling = true;
      // Call the action to cancel the subscription
      let res = await this.$store.dispatch('subscriptions/cancelSubscriptionAtEndOfPeriod');
      this.cancelling = false;
      if (res) {
          this.$toast.success(
          this.$t("Your Pro subscription has been cancelled. You can still use Pro features before the end of the current billing period."),
          { duration: 5000 }
        );
      } else {
        this.$toast.error(
          this.$t("There was an error cancelling your Pro subscription."),
          { duration: 5000 }
        );
      }
    },
  },
};
</script>
