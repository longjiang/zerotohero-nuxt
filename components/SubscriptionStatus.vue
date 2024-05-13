<template>
  <div>
    <div v-if="subscription && !pro">
      {{
      $t("Your Pro has expired on {date}.", {
        date: $d(
          new Date(subscription.expires_on),
          "short",
          $l1.code
        ),
      })
    }}
    </div>
    <div v-if="subscription &&
      pro &&
      subscription.type !== 'lifetime' &&
      subscription.payment_processor === 'stripe'
      ">
      🚀
      {{
      $t("Your Pro will auto-renew on {date}.", {
        date: $d(
          new Date(subscription.expires_on),
          "short",
          $l1.code
        ),
      })
    }}
      <i18n path="To change or cancel, go to {stripe}.">
        <template #stripe>
          <a href="https://billing.stripe.com/p/login/aEUeYr0Gu6GW9BSbII" target="_blank">{{
        $t("Stripe")
      }}</a>
        </template>
      </i18n>
    </div>
    <div v-if="subscription &&
      pro &&
      subscription.type !== 'lifetime' &&
      subscription.payment_processor !== 'stripe'
      ">
      🚀
      {{
      $t("Your Pro will expire on {date}.", {
        date: $d(
          new Date(subscription.expires_on),
          "short",
          $l1.code
        ),
      })
    }}
    </div>
    <div v-if="subscription && subscription.type === 'lifetime'">
      🚀 {{ $t("You have lifetime access to Pro.") }}
    </div>
    <div v-if="!subscription">
      {{ $t("You are not Pro yet.") }}
    </div>
    <div v-if="!pro">
      <router-link :to="{ name: 'go-pro' }">{{ $t("Upgrade to Pro") }} 🚀</router-link>
    </div>
  </div>
</template>
<script>

export default {
  computed: {
    pro() {
      return this.$store.state.subscriptions.active;
    },    
    subscription() {
      return this.$store.state.subscriptions.subscription;
    },
  },
}
</script>