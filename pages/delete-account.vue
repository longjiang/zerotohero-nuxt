<template>
  <div class="main pb-5">
    <client-only>
      <div v-if="!$auth.loggedIn" class="container">
        <div class="row">
          <div class="col-sm-12">
            <div class="text-center bg-accent p-4 rounded mt-4">
              <p>{{ $t("Before we can delete your account, you need to login.") }}</p>
              <router-link :to="{ name: 'login' }" class="btn btn-success">
                {{ $t("Login") }}
                <i class="fas fa-chevron-right"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <div class="container" v-else>
        <div class="row mb-3">
          <div class="col-sm-12 text-center">
            <h4>{{ formatName($auth.user.first_name, $auth.user.last_name) }}</h4>
            <div>{{ $auth.user.email }}</div>
          </div>
        </div>
        <div class="row mt-5">
          <div class="col-sm-12 text-center">
            <div class="bg-accent rounded p-4">
              <div v-if="hasActiveSubscription">
                <p>{{ $tb('You have an existing active subscription:') }}</p>
                <SubscriptionStatus class="my-3" :showActionButtons="false" />
                <p><strong>{{ $tb('You must cancel your active subscription before you can delete your account.') }}</strong></p>
                <CancelSubscriptionButton :subscription="subscription" variant="success" class="w-100" :text="$tb('Cancel Existing Subscription')" />
              </div>
              <div v-else>
                <h5>{{ $t("Confirm Account Deletion") }}</h5>
                <p>
                  {{ $t("We're sorry to see you go.") }}
                  {{ $t("Once your account is deleted, all of your content will be permanently gone.") }}
                </p>
                <p>{{ $t("To confirm deletion, type 'delete' below:") }}</p>
                <input type="text" v-model="confirmText" class="form-control mb-3" placeholder="delete"/>
                <button class="btn btn-danger" @click="confirmDeletion" :disabled="confirmText !== 'delete'">
                  {{ $t("Confirm Deletion") }}
                </button>
                <b-button @click="$router.back()" variant="secondary ml-2">{{ $t("Cancel") }}</b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </client-only>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { formatName } from "@/lib/utils";

export default {
  data() {
    return {
      confirmText: "",
    };
  },
  computed: {
    ...mapState("subscriptions", ["subscription"]),
    subscription() {
      return this.$store.state.subscriptions.subscription;
    },
    hasActiveSubscription() {
      if (!this.subscription) return false;
      if (!this.subscription.payment_customer_id) return false; // Only those with a payment_customer_id have a renewing subscription with Stripe
      // Make sure subscription is active and not expired
      if (!this.subscription.expires_on) return false;
      const expiresOn = new Date(this.subscription.expires_on.replace(' ', 'T')); // subscription.expires_on is in the format 2024-06-14 10:16:40, but we need a Date object for comparison
      const currentDate = new Date();
      return currentDate < expiresOn;
    },
  },
  methods: {
    formatName,
    async confirmDeletion() {
      if (!this.hasActiveSubscription && this.confirmText === 'delete') {
        // Add logic to delete account
        try {
          let res = await this.$directus.get(`users/me`);
          let user = res?.data?.data;
          if (user) {
            if (user.role !== 1) {
              let url = `users/${user.id}`;
              await this.$directus.patch(url, { status: "inactive" });
              this.$toast.success("Your account has been deleted.", {
                duration: 5000,
              });
              this.$router.push("/logout");
            } else {
              this.$toast.error("Cannot delete your account because you're an Admin.", {
                duration: 5000,
              });
            }
          } else {
            this.$toast.error(
              "Cannot delete your account because your information cannot be retrieved.",
              { duration: 5000 }
            );
          }
        } catch (error) {
          console.error(error);
          this.$toast.error(
            "Something went wrong during the account deletion process.",
            { duration: 5000 }
          );
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";
</style>