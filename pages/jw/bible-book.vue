<router>
  {
    path: '/:l1/:l2/bible/book/:id',
    props: true
  }
</router>
<template>
  <div class="container main">
    <div v-if="book">
      <h2 class="mt-3 mb-3">{{ book.title }}</h2>
      <div class="">
        <NuxtLink
          v-for="chapter in book.chapters"
          class="shadow bg-dark rounded p-3 text-white d-inline-block mr-1 mb-1"
          :key="`chapter-${chapter.number}`"
          :to="{
            name: 'jw-bible-chapter',
            params: { bookId: id, chapterId: chapter.number },
          }"
        >
          {{ chapter.number }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script>
import Wol from "@/lib/jw/Wol";

export default {
  props: ["id"],
  data() {
    return {
      book: undefined,
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
    this.book = await Wol.getBibleBook(this.id, this.$l2);
    // console.log(await Wol.('https://wol.jw.org/en/wol/b/r1/lp-e/nwt/1/1'))
  },
};
</script>

<style>
</style>