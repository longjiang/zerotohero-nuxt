<router>
  {
    path: '/:l1/:l2/bible/chapter/:bookId/:chapterId',
    props: true
  }
</router>
<template>
  <div class="container main">
    <BibleChapter :bibleId="1" :bookId="bookId" :chapterId="chapterId" />
  </div>
</template>

<script>

export default {
  props: ["bookId", "chapterId"],
  data() {
    return {
      chapter: undefined,
    };
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
  },
};
</script>

<style>
</style>