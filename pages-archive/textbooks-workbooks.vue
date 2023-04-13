<router>
  {
    path: '/:l1/:l2/textbooks-workbooks'
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5">
      <TextbooksEnZh id="7" v-if="$l1.code === 'en' && $l2.code === 'zh'" />
      <TextbooksZhEn id="8" v-if="$l1.code === 'zh' && $l2.code === 'en'" />
    </div>
  </div>
</template>

<script>
import TextbooksEnZh from "@/components/TextbooksEnZh";
import TextbooksZhEn from "@/components/TextbooksZhEn";

export default {
  components: {
    TextbooksEnZh,
    TextbooksZhEn,
  },
  computed: {
  },
};
</script>

<style></style>
