<template>

    <div class="container-fluid pt-3 pb-5">
      <div class="row">
        <div class="col-sm-12">
          <h4 class="text-center mb-4">{{ $t('Pinyin Chart') }}</h4>
          <PinyinChart style="margin: 0 auto;"/>
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
