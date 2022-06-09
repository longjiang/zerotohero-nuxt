<router>
  {
    path: '/:l1/:l2/bible/book/:id',
    props: true
  }
</router>
<template>
  <div class="container mx-auto mt-10 mb-10">
    <div v-if="book">
      <h2 class="mb-6">{{ book.title }}</h2>
      <div class="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2">
        <NuxtLink
          v-for="chapter in book.chapters"
          class="shadow-md bg-indigo-900 rounded-md p-3 text-white"
          :key="`chapter-${chapter.number}`"
          :to="{
            name: 'bible-chapter',
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
import Wol from "@/lib/Wol";

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