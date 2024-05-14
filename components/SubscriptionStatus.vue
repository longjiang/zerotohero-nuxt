<template>
  <div>
    <div class="row text-left">
      <div class="col-sm-12">
        <strong>{{ $t('Plan') }}:</strong> {{ subscription ? $t(type[subscription.type]) : $t(type['free']) }} <span
          v-if="!subscription || subscription.type !== 'lifetime'">(<router-link :to="{ name: 'go-pro' }"><u>{{
          $t('Change') }}</u></router-link>)</span>
      </div>
      <div class="col-sm-12" v-if="subscription">
        <strong>{{ $t('Expires') }}:</strong> {{ subscription.expires_on ? $d(
          new Date(subscription.expires_on),
          "short",
          this.$browserLanguage
        ) : $t('Never') }}
      </div>
      <div class="col-sm-12" v-if="subscription && subscription.type !== 'lifetime'">
        <strong>{{ $t('Auto-Renew') }}:</strong> {{ subscription.payment_customer_id ? $t('Yes') : $t('No') }}
        <span v-if="subscription.payment_customer_id">(<b-button @click="cancelSubscriptionAtEndOfPeriod" variant="link"
            class="text-danger p-0 mb-1" :disabled="cancelling">
            <b-spinner small v-if="cancelling" />
            <u v-else>{{ $t('Cancel') }}</u>
          </b-button>)
        </span>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  data() {
    return {
      cancelling: false,
      type: {
        monthly: this.$t('Pro (Monthly)'),
        annual: this.$t('Pro (Annual)'),
        lifetime: this.$t('Pro (Lifetime)'),
        trial: this.$t('Pro (Trial)'),
        free: this.$t('Free'),
      }
    };
  },
  computed: {
    pro() {
      return this.$store.state.subscriptions.active;
    },
    subscription() {
      return this.$store.state.subscriptions.subscription;
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
      await this.$store.dispatch('subscriptions/cancelSubscriptionAtEndOfPeriod');
      this.cancelling = false;
      this.$toast.success(
        this.$t("Your Pro subscription has been cancelled. You can still use Pro features before the end of the current billing period."),
        { duration: 5000 }
      );
    },
  },
}
</script>