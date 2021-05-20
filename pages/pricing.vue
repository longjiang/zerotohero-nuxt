<router>
  {
    path: '/:l1/:l2/pricing/:currency?',
    props: true,
    meta: {
      title: 'Pricing | Zero To Hero',
      metaTags: [
        {
          name: 'description',
          content:
            'No subscription required. Pay once, own the courses forever. Wallet Friendly Pricing.'
        }
      ]
    }
  }
</router>
<template>
  <div class="container mt-5 mb-5">
    <div v-if="$l1.code === 'en' && $l2.code === 'zh'">
      <PricingEnZh :currency="currency" />
    </div>
    <div v-if="$l1.code === 'zh' && $l2.code === 'en'">
      <PricingZhEn :currency="currency" />
    </div>
  </div>
</template>

<script>
import PricingZhEn from '@/components/PricingZhEn'
import PricingEnZh from '@/components/PricingEnZh'
export default {
  components: {
    PricingZhEn,
    PricingEnZh
  },
  props: {
    currency: {
      default: 'USD'
    }
  }
}
</script>

<style>
.sale-price {
  color: red;
}
.pricing-table td:first-child,
.pricing-table th:first-child {
  font-weight: bold;
  max-width: 10rem;
}

.pricing-table a,
.pricing-table a:hover {
  color: white;
}
</style>
