<router>
  {
    path: '/:l1/:l2/admin/manage-subscriptions/:start?',
    props: true
  }
</router>
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
          <b-form-input
            v-model="checkUserSubscriptionEmail"
            placeholder="User email"
            class="mb-3"
          ></b-form-input>
          <b-button @click="checkUserSubscription" variant="primary">Check</b-button>
          <!-- show a code block with the result -->
          <div v-if="checkUserSubscriptionResult" class="bg-accent mt-3 rounded p-3">
            <pre class="text-contrast">{{ checkUserSubscriptionResult }}</pre>
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
              <b-form-select v-model="updateOrAddSubscriptionData.type" :options="['monthly', 'annual', 'lifetime']" required></b-form-select>
            </b-form-group>

            <b-form-group label="Payment Processor">
              <b-form-select v-model="updateOrAddSubscriptionData.payment_processor" :options="['app-store', 'paypal', 'stripe', 'other']" required></b-form-select>
            </b-form-group>

            <b-form-group label="Payment ID">
              <b-form-input v-model="updateOrAddSubscriptionData.payment_id"></b-form-input>
            </b-form-group>

            <b-form-group label="Notes">
              <b-form-textarea v-model="updateOrAddSubscriptionData.notes" rows="3" max-rows="5"></b-form-textarea>
            </b-form-group>

            <b-button type="submit" variant="primary">Submit</b-button>
          </b-form>
          <!-- show a code block with the result -->
          <div v-if="updateOrAddSubscriptionDataResult" class="bg-accent mt-3 rounded p-3">
            <pre class="text-contrast">{{ updateOrAddSubscriptionDataResult }}</pre>
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
      checkUserSubscriptionEmail: null,
      checkUserSubscriptionResult: null,
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
    checkUserSubscription() {
      this.$axios
        .get(`${PYTHON_SERVER}admin/check_user_subscription?email=${this.checkUserSubscriptionEmail}`)
        .then((res) => {
          this.checkUserSubscriptionResult = res.data
        })
        .catch((err) => {
          this.checkUserSubscriptionResult = err
        })
    },
    onUpdateOrAddSubscriptionSubmit(evt) {
      evt.preventDefault()
      this.$axios
        .post(`${PYTHON_SERVER}admin/update_or_add_subscription`, this.updateOrAddSubscriptionData)
        .then((res) => {
          this.updateOrAddSubscriptionDataResult = res.data
        })
        .catch((err) => {
          this.updateOrAddSubscriptionDataResult = err
        })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>