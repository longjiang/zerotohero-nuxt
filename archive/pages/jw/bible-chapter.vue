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
};
</script>

<style>
</style>