<router>
  {
    path: '/:l1/:l2/textbooks-workbooks'
  }
</router>
<template>
  <div class="container main pt-5 mb-5">
    <TextbooksEnZh id="7" v-if="$l1.code === 'en' && $l2.code === 'zh'" />
    <TextbooksZhEn id="8" v-if="$l1.code === 'zh' && $l2.code === 'en'" />
  </div>
</template>

<script>
import TextbooksEnZh from '@/components/TextbooksEnZh'
import TextbooksZhEn from '@/components/TextbooksZhEn'

export default {
  components: {
    TextbooksEnZh,
    TextbooksZhEn
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  }
}
</script>

<style></style>
