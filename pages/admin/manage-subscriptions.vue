<template>
  <div class="main">
    <div class="container pt-5">
      <div class="row">
        <div class="col-sm-12">
          <h4>Manage Subscriptions</h4>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div>Check user subscription:</div>
          <b-form @submit.prevent="onCheckUserSubscriptionSubmit">
            <b-form-input
              v-model="checkUserSubscriptionEmail"
              placeholder="User email"
              class="mb-3"
            ></b-form-input>
            <b-button type="submit" variant="primary">Check</b-button>
          </b-form>
          <div class="position-container mt-3 rounded overflow-hidden">
            <!-- Show skeleton screen while data is loading -->
            <div v-if="checkUserSubscriptionEmailLoading" class="skeleton-screen"></div>
            <!-- Show data when it's loaded -->
            <div v-else-if="checkUserSubscriptionResult" class="data-container p-3 bg-accent">
              <pre class="text-contrast">{{ checkUserSubscriptionResult }}</pre>
            </div>
          </div>
          <hr />
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div>Update or add subscription:</div>
          

          <b-form @submit="onUpdateOrAddSubscriptionSubmit">
            <b-form-group label="Email">
              <b-form-input v-model="updateOrAddSubscriptionData.email" type="email" required></b-form-input>
            </b-form-group>

            <b-form-group label="Type">
              <b-form-select v-model="updateOrAddSubscriptionData.type" :options="['monthly', 'annual', 'lifetime', 'trial']" required></b-form-select>
            </b-form-group>

            <b-form-group label="Payment Processor">
              <b-form-select v-model="updateOrAddSubscriptionData.payment_processor" :options="['app-store', 'paypal', 'stripe', 'other']"></b-form-select>
            </b-form-group>

            <b-form-group label="Payment ID">
              <b-form-input v-model="updateOrAddSubscriptionData.payment_id"></b-form-input>
            </b-form-group>

            <b-form-group label="Notes">
              <b-form-textarea v-model="updateOrAddSubscriptionData.notes" rows="3" max-rows="5"></b-form-textarea>
            </b-form-group>

            <b-button type="submit" variant="primary">Submit</b-button>
          </b-form>
          <div class="position-container mt-3 rounded overflow-hidden">
            <!-- Show skeleton screen while data is loading -->
            <div v-if="updateOrAddSubscriptionDataLoading" class="skeleton-screen"></div>
            <!-- Show data when it's loaded -->
            <div v-else-if="updateOrAddSubscriptionDataResult" class="data-container p-3 bg-accent">
              <pre class="text-contrast">{{ updateOrAddSubscriptionDataResult }}</pre>
            </div>
          </div>
          <hr />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { PYTHON_SERVER } from '@/lib/utils'

export default {
  data() {
    return {
      checkUserSubscriptionEmailLoading: false,
      checkUserSubscriptionEmail: null,
      checkUserSubscriptionResult: null,
      updateOrAddSubscriptionDataLoading: false,
      updateOrAddSubscriptionData: {
        email: undefined,
        type: undefined,
        payment_processor: undefined,
        payment_id: undefined,
        notes: 'System failed to update the subscription.',
      },
      updateOrAddSubscriptionDataResult: null,
    }
  },
  methods: {
    onCheckUserSubscriptionSubmit() {
      this.checkUserSubscriptionEmailLoading = true;
      this.$axios
        .get(`${PYTHON_SERVER}admin/check_user_subscription?email=${this.checkUserSubscriptionEmail}`)
        .then((res) => {
          this.checkUserSubscriptionResult = res.data;
        })
        .catch((err) => {
          this.checkUserSubscriptionResult = err;
        })
        .finally(() => {
          this.checkUserSubscriptionEmailLoading = false;
        });
    },
    onUpdateOrAddSubscriptionSubmit(evt) {
      evt.preventDefault();
      this.updateOrAddSubscriptionDataLoading = true;
      this.$axios
        .post(`${PYTHON_SERVER}admin/update_or_add_subscription`, this.updateOrAddSubscriptionData)
        .then((res) => {
          this.updateOrAddSubscriptionDataResult = res.data;
        })
        .catch((err) => {
          this.updateOrAddSubscriptionDataResult = err;
        })
        .finally(() => {
          this.updateOrAddSubscriptionDataLoading = false;
        });
    }
  }
}
</script>
<style lang="scss" scoped>
.skeleton-screen {
  width: 100%;
  height: 100px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.2) 100%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>