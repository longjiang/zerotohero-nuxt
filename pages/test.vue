<router>
  {
    path: '/:l1/:l2/test'
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5">
      <div class="row">
        <div class="col-sm-12">
          <ChatGPT :initialMessages="['Please explain the Japanese word 有り難い and give its morphological breakdown.']" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    $l1() {
      return this.$store.state.settings.l1;
    },
    $l2() {
      return this.$store.state.settings.l2;
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>