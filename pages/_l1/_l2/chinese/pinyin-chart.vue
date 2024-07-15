<template>
  <PinyinChart />
</template>

<script>
export default {
  components: {
    PinyinChart: () => import('@/components/PinyinChart.vue')
  }
}
</script>
