<template>
  <div class="main">
    <div class="container pt-3 pb-5">
      <div class="row">
        <div class="col-sm-12">
          <PinyinChart />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    PinyinChart: () => import('@/components/PinyinChart.vue')
  }
}
</script>
