<template>
  <div class="purchase-paypal">
    <div class="purchase-paypal-alerts">
      <div
        class="alert alert-success p-3 text-center"
        v-if="paypalPaymentStatus === 'success'"
      >
        <Loader
          :sticky="true"
          message="Payment successful, activating your Pro account..."
        />
      </div>
      <div
        class="alert alert-warning p-3 text-center"
        v-if="paypalPaymentStatus === 'cancelled'"
      >
        {{ $tb("It seems like you've cancelled the checkout, please try again.") }}
      </div>
      <div
        class="alert alert-warning p-3 text-center"
        v-if="paypalPaymentStatus === 'error'"
      >
        <p>
          {{ $tb("We're sorry, your payment didn't work this time, please try again.") }}
        </p>
        <p>
          {{ $tb('If you need further assistance, please contact support') }}: <a href="mailto:jon.long@zerotohero.ca">{{ $tb('Send us an email') }}</a>
        </p>
      </div>
    </div>
    <div v-if="price" ref="paypalButton" class="paypal-button-container"></div>
  </div>
</template>

<script>
import { PYTHON_SERVER, SALE } from "../lib/utils";
import { HOST } from "../lib/utils/url";
import { getPrices } from "../lib/prices";

export default {
  data() {
    return {
      price: undefined, // Updated in created()
      paypalPaymentStatus: undefined,
      paypalRendered: false,
      paypalLoading: false,
      paypalEnv: process.env.PAYPAL_ENV || 'production',
      paypalCredentials: {
        sandbox: process.env.PAYPAL_SANDBOX_CLIENT_ID || '',
        production: process.env.PAYPAL_CLIENT_ID || '',
      },
    }
  },
  async created() {
    try {
      const allPlans = await getPrices()
      const lifetimeUSDPlan = allPlans.find(price => price.status === 'current' && price.type === (SALE ? 'sale' : 'regular') && price.plan === 'lifetime' && price.currency === 'usd')
      this.price = lifetimeUSDPlan.amount.toFixed(2)
      console.log('[LP Classic] PayPal price set:', this.price)
    } catch (error) {
      console.error('[LP Classic] PayPal failed to fetch prices:', error)
      this.paypalPaymentStatus = 'error'
    }
  },
  mounted() {
    this.renderPayPalButton()
  },
  watch: {
    price() {
      this.$nextTick(() => this.renderPayPalButton())
    },
  },
  methods: {
    renderPayPalButton() {
      if (this.paypalRendered || this.paypalLoading) {
        console.log('[LP Classic] PayPal render skipped (already rendering/rendered)')
        return
      }
      if (!this.price) {
        console.log('[LP Classic] PayPal price not ready yet, deferring render')
        return
      }
      this.paypalLoading = true
      this.paypalPaymentStatus = undefined // clear any stale warning
      const clientId = this.paypalEnv === 'sandbox'
        ? this.paypalCredentials.sandbox
        : this.paypalCredentials.production
      console.log('[LP Classic] PayPal env:', this.paypalEnv, 'clientId present:', !!clientId)
      if (!clientId) {
        console.error(`[LP Classic] PayPal client id missing for env ${this.paypalEnv}`)
        this.paypalPaymentStatus = 'error'
        return
      }

      const sdkBase = this.paypalEnv === 'sandbox'
        ? 'https://www.sandbox.paypal.com/sdk/js'
        : 'https://www.paypal.com/sdk/js'
      const sdkUrl = `${sdkBase}?client-id=${clientId}&intent=capture&currency=USD&components=buttons&disable-funding=card,credit,paylater`

      const script = document.createElement('script')
      script.src = sdkUrl
      console.log('[LP Classic] PayPal loading SDK:', sdkUrl)
      script.onload = () => {
        console.log('[LP Classic] PayPal SDK loaded')
        try {
          if (this.paypalRendered) return
          const buttons = window.paypal.Buttons({
            createOrder: async () => {
              const userId = this.$auth.user && this.$auth.user.id
              console.log('[LP Classic] PayPal createOrder user:', userId, 'amount:', this.price)
              try {
                // Must go through $axios, not plain fetch: the backend binds
                // the order's user_id to the caller's JWT once
                // ENFORCE_PURCHASE_USER_BINDING is enabled, and only $axios
                // attaches (and refreshes) the Supabase token.
                const data = await this.$axios.$post(`${PYTHON_SERVER}create-paypal-order`, {
                  user_id: userId,
                  host: HOST,
                  amount: this.price,
                })
                console.log('[LP Classic] PayPal createOrder response:', data)
                return data.id
              } catch (err) {
                console.error('[LP Classic] PayPal createOrder error:', err)
                throw err
              }
            },
            onApprove: (data) => {
              console.log('[LP Classic] PayPal approved order:', data.orderID)
              this.paypalPaymentStatus = 'success'
              window.location = `${PYTHON_SERVER}paypal_checkout_success?order_id=${data.orderID}&user_id=${this.$auth.user.id}&host=${HOST}`
            },
            onCancel: () => {
              console.log('[LP Classic] PayPal cancelled')
              this.paypalPaymentStatus = 'cancelled'
            },
            onError: (err) => {
              console.error('[LP Classic] PayPal error:', err)
              this.paypalPaymentStatus = 'error'
            },
          })
          const renderResult = buttons.render(this.$refs.paypalButton)
          if (renderResult && renderResult.then) {
            renderResult.then(() => {
              this.paypalRendered = true
              this.paypalLoading = false
              console.log('[LP Classic] PayPal button rendered')
            }).catch((err) => {
              this.paypalLoading = false
              console.error('[LP Classic] PayPal render failed:', err)
              this.paypalPaymentStatus = 'error'
            })
          } else {
            this.paypalRendered = true
            this.paypalLoading = false
            console.log('[LP Classic] PayPal button rendered')
          }
        } catch (err) {
          this.paypalLoading = false
          console.error('[LP Classic] PayPal render failed:', err)
          this.paypalPaymentStatus = 'error'
        }
      }
      script.onerror = () => {
        this.paypalLoading = false
        // Don't show the red "payment failed" alert for a load failure — the
        // button is simply absent. Log loudly instead.
        console.error('[LP Classic] PayPal SDK script failed to load — button hidden')
      }
      document.head.appendChild(script)
    },
  },
}
</script>

<style lang="scss" scoped>
.purchase-paypal {
  .paypal-button-container {
    max-width: 15rem;
    margin: 0 auto;
  }
}
</style>
