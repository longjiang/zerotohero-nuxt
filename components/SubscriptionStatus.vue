<template>
  <div>
    <div class="row text-left">
      <div class="col-sm-12">
        <strong>{{ $t('Plan') }}:</strong> {{ subscription ? $t(type[subscription.type]) : $t(type['free']) }}
        <template v-if="showActionButtons">
          <span v-if="!subscription || subscription.type !== 'lifetime'"><router-link class="btn btn-small btn-primary mb-1" :to="{ name: 'go-pro' }">{{
          $t('Upgrade') }} <i class="fa fa-chevron-right"></i></router-link></span>
        </template>

      </div>
      <div class="col-sm-12" v-if="subscription">
        <strong>{{ $t('Expires') }}:</strong> {{ subscription.expires_on ? $d(
          new Date(subscription.expires_on),
          "short",
          this.$l1
        ) : $t('Never') }}
      </div>
      <div class="col-sm-12" v-if="subscription && ['monthly', 'annual'].includes(subscription.type)">
        <strong>{{ $t('Auto-Renew') }}:</strong> {{ subscription.payment_customer_id ? $t('Yes') : $t('No') }}
        <template v-if="showActionButtons">
          <span v-if="subscription.payment_customer_id"><CancelSubscriptionButton v-if="subscription.payment_customer_id" :subscription="subscription"
              variant="secondary" size="small" class="mb-1 ml-1" />
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import CancelSubscriptionButton from './CancelSubscriptionButton.vue';

export default {
  props: {
    showActionButtons: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    CancelSubscriptionButton,
  },
  data() {
    return {
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
      const subscription = this.$store.state.subscriptions.subscription;
      if (!subscription || (subscription.type !== 'lifetime' && new Date(subscription.expires_on) < new Date())) {
        return null; // No active subscription or subscription has expired, so we show it as 'free'
      }
      return subscription;
    },
  },
}
</script>
