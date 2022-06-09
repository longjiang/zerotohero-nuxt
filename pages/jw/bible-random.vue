<router>
  {
    path: '/:l1/:l2/bible/random',
    props: true
  }
</router>
<template>
  <div class="container mx-auto mt-10"></div>
</template>

<script>
export default {
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
  async fetch() {
    let randomBookChapter = this.randomBookChapter();
    this.$router.push({ name: "bible-chapter", params: randomBookChapter });
  },
  methods: {
    randomBookChapter() {
      let chaptersByBook = [
        50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42,
        150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4,
        28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5,
        3, 5, 1, 1, 1, 22,
      ];
      let totalChapters = chaptersByBook.reduce(function (
        accumulator,
        currentValue
      ) {
        return accumulator + currentValue;
      },
      0);
      let rand = Math.floor(Math.random() * totalChapters);
      let remaining = rand;
      for (let bookIndex in chaptersByBook) {
        let chapters = chaptersByBook[bookIndex];
        if (remaining < chapters) {
          return {
            bookId: Number(bookIndex) + 1,
            chapterId: remaining + 1,
          };
        } else {
          remaining = remaining - chapters;
        }
      }
    },
  },
};
</script>

<style>
</style>