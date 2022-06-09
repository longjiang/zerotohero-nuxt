<router>
  {
    path: '/:l1/:l2/bible',
    props: true
  }
</router>
<template>
  <div class="container mx-auto mt-10 mb-10">
    <div v-if="bibleBookGroups">
      <div
        v-for="group in bibleBookGroups"
        :key="`bible-book-group-${group.title}`"
        class="mt-6"
      >
        <h2 class="mb-6">{{ group.title }}</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          <NuxtLink
            v-for="book in group.books"
            class="shadow-md bg-blue-900 rounded-md p-3 text-white"
            :key="`book-${book.number}`"
            :to="{ name: 'bible-book', params: { id: book.number } }"
          >
            {{ book.title }}
            <i
              class="fas fa-headphones text-indigo-500 float-right"
              v-if="book.audio"
            ></i>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Wol from "@/lib/Wol";

export default {
  data() {
    return {
      bibleBookGroups: undefined,
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
    this.bibleBookGroups = await Wol.getBibleBookGroups(this.$l2);
  },
};
</script>

<style>
</style>