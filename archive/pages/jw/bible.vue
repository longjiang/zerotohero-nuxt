<router>
  {
    path: '/:l1/:l2/bible',
    props: true
  }
</router>
<template>
  <div class="container main mx-auto mt-10 mb-10">
    <div v-if="bibleBookGroups">
      <div
        v-for="group in bibleBookGroups"
        :key="`bible-book-group-${group.title}`"
        class="mt-3"
      >
        <h2 class="mb-3">{{ group.title }}</h2>
        <div class="">
          <NuxtLink
            v-for="book in group.books"
            class="shadow bg-dark rounded p-3 text-white d-inline-block mr-1 mb-1"
            :key="`book-${book.number}`"
            :to="{ name: 'jw-bible-book', params: { id: book.number } }"
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
import Wol from "@/lib/jw/Wol";

export default {
  data() {
    return {
      bibleBookGroups: undefined,
    };
  },
  async created() {
    this.bibleBookGroups = await Wol.getBibleBookGroups(this.$l2);
  },
};
</script>

<style>
</style>