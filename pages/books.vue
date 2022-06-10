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
            <h3 class="text-center mt-3">{{ $l2.name }} Books</h3>
            <p class="text-center" v-if="count">({{ count }} books)</p>
          </div>
        </div>
        <div class="row mb-4 p-2">
          <div class="col-sm-12 d-flex">
            <b-form-input
              class="mr-1 w-100"
              type="text"
              placeholder="Search"
              v-model="search"
              :lazy="true"
            />
            <b-form-select
              style="width: 10rem"
              v-if="bookshelves"
              v-model="bookshelf"
              :options="bookshelfOptions"
            ></b-form-select>
          </div>
        </div>
        <div class="row mt-5 mb-5" v-if="!books">
          <div class="col-sm-12 text-center">
            <Loader :sticky="true" message="Loading books..." />
          </div>
        </div>
        <div class="row" v-if="books">
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
        <div class="row" v-if="books && books.length === 0">
          <div class="col-sm-12">
            <div class="text-center">
              Sorry, we could not find any {{ $l2.name }} books matching your
              search term 😭.
            </div>
          </div>
        </div>
      </div>
    </container-query>
  </div>
</template>

<script>
import { ContainerQuery } from "vue-container-query";
import Helper from "@/lib/helper";

export default {
  components: {
    ContainerQuery,
  },
  data() {
    return {
      books: undefined,
      count: undefined,
      next: undefined,
      search: undefined,
      bookshelves: undefined,
      bookshelf: null,
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
    bookshelfOptions() {
      if (this.bookshelves) {
        let options = this.bookshelves.map((s) => {
          return { value: s, text: s };
        });
        options = [{ value: null, text: "All Topics" }, ...options];
        return options;
      } else {
        return [];
      }
    },
  },
  async created() {
    this.getBooks();
  },
  watch: {
    search() {
      this.getBooks();
    },
    bookshelf() {
      this.getBooks();
    },
  },
  methods: {
    async getBooks() {
      this.books = undefined;
      try {
        let params = {
          languages: this.$l2.code,
          mime_type: "text/html",
        };
        if (this.search) {
          params.search = this.search;
        }
        if (this.bookshelf) {
          params.topic = this.bookshelf;
        }
        let data = await Helper.proxy(
          "http://gutendex.com/books?" + Helper.queryString(params)
        );
        if (data && data.results) {
          let books = data.results;
          this.books = books;
          this.count = data.count;
          this.next = data.next;
          let bookshelves = this.bookshelves || [];
          this.books.forEach(
            (b) => (bookshelves = bookshelves.concat(b.bookshelves))
          );
          this.bookshelves = Helper.unique(bookshelves).sort((a, b) =>
            a.localeCompare(b)
          );
        }
      } catch (err) {
        Helper.logError(err);
      }
    },
  },
};
</script>

<style>
</style>