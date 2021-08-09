<router>
  {
    path: '/:l1/:l2/faq'
  }
</router>
<template>
  <div class="main">
    <div class="faq container pt-5 pb-5">
      <SocialHead
        :title="`Frequently Asked Questions | ${$l2.name} Zero to Hero`"
      />
      <div class="row" v-if="$l1.code === 'en' && $l2.code === 'zh'">
        <FAQEnZh />
      </div>
      <div class="row" v-if="$l1.code === 'zh' && $l2.code === 'en'">
        <FAQZhEn />
      </div>
    </div>
  </div>
</template>


<script>
import FAQZhEn from "@/components/FAQZhEn";
import FAQEnZh from "@/components/FAQEnZh";

export default {
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  components: {
    FAQZhEn,
    FAQEnZh,
  },
};
</script>

<style>
</style>
