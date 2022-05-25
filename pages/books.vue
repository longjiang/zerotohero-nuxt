<router>
  {
    path: '/:l1/:l2/books',
  }
</router>
<template>
  <div class="main books pt-5 pb-5">
    <container-query :query="query" v-model="params">
      <div class="container pb-5">
        <div class="row">
          <div class="col-sm-12">
            <!-- <Sale class="mt-5 mb-5" v-if="$l2.code === 'zh'" /> -->
            <h3 class="text-center mt-5 mb-5">{{ $l2.name }} Books</h3>
            <div class="mb-5">
              <div
                :class="{
                  'loader text-center': true,
                  'd-none': books,
                }"
                style="flex: 1"
              >
                <Loader :sticky="true" message="Loading books..." />
              </div>
              <div class="text-center" v-if="books && books.length === 0">
                Sorry, we could not find any books for {{ $l2.name }} 😭.
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div
            v-for="book in books"
            :key="book.id"
            :class="{
              'mb-5': true,
              'col-6': params.xs,
              'col-4': params.sm,
              'col-3': params.md,
              'col-2': params.lg,
            }"
          >
            <BookCard :book="book" />
          </div>
        </div>
      </div>
    </container-query>
  </div>
</template>

<script>
import { ContainerQuery } from "vue-container-query";
import axios from "axios";

export default {
  components: {
    ContainerQuery,
  },
  data() {
    return {
      books: undefined,
      params: {},
      query: {
        xs: {
          minWidth: 0,
          maxWidth: 423,
        },
        sm: {
          minWidth: 423,
          maxWidth: 720,
        },
        md: {
          minWidth: 720,
          maxWidth: 960,
        },
        lg: {
          minWidth: 960,
          maxWidth: 1140,
        },
        xl: {
          minWidth: 1140,
        },
      },
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
  async created() {
    try {
      let params = {
        languages: this.$l2.code,
        mime_type: 'text/html'
      };
      let res = await axios.get("http://gutendex.com/books", { params });
      if (res && res.data && res.data.results) {
        let books = res.data.results;
        this.books = books;
      }
    } catch (err) {
      console.log(err);
    }
  },
};
</script>

<style>
</style>