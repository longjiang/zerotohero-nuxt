<router>
  {
    path: '/:l1/:l2/books',
  }
</router>
<template>
  <div class="main books pb-5">
    <container-query :query="query" v-model="params">
      <div class="container pb-5">
        <div class="row">
          <div class="col-sm-12">
            <!-- <Sale class="mt-5 mb-5" v-if="$l2.code === 'zh'" /> -->
            <h3 class="text-center mt-3">
              {{ $t("{l2} Books", { l2: $t($l2.name) }) }}
            </h3>
            <p class="text-center" v-if="count">
              ({{ $t("{count} books", { count }) }})
            </p>
          </div>
        </div>
        <div class="row mb-4 p-2">
          <div class="col-sm-12 d-flex">
            <b-form-input
              class="mr-1 w-100"
              type="text"
              :placeholder="$t('Search')"
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
            <Loader :sticky="true" message="$t('Loading books...')" />
          </div>
        </div>
        <div class="row" v-if="books">
          <div
            v-for="(book, index) in books"
            :key="`book-${index}`"
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
          <div class="text-center col-12">
            <infinite-loading
              @infinite="loadMoreBooks"
              ref="infiniteLoading"
            ></infinite-loading>
          </div>
        </div>
        <div class="row" v-if="books && books.length === 0">
          <div class="col-sm-12">
            <div class="text-center">
              {{
                $t(
                  "Sorry, we could not find any {l2} books matching your search term.",
                  { l2: $t($l2.name) }
                )
              }}
              😭
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
import InfiniteLoading from "vue-infinite-loading";

export default {
  components: {
    ContainerQuery,
    InfiniteLoading,
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
    bookshelfOptions() {
      if (this.bookshelves) {
        let options = this.bookshelves.map((s) => {
          return { value: s, text: this.$t(s) };
        });
        options = [{ value: null, text: this.$t("All Topics") }, ...options];
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
      // Reset the next URL and count before fetching new books
      this.next = undefined;
      this.count = undefined;
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
    async loadMoreBooks($state) {
      if (!this.next) {
        $state.complete();
        return;
      }

      try {
        let data = await Helper.proxy(this.next);

        if (data && data.results) {
          this.books = this.books.concat(data.results);
          this.count = data.count;
          this.next = data.next;

          let bookshelves = this.bookshelves || [];
          data.results.forEach(
            (b) => (bookshelves = bookshelves.concat(b.bookshelves))
          );
          this.bookshelves = Helper.unique(bookshelves).sort((a, b) =>
            a.localeCompare(b)
          );
        }

        if (this.next) {
          $state.loaded();
        } else {
          $state.complete();
        }
      } catch (err) {
        Helper.logError(err);
        $state.error();
      }
    },
  },
};
</script>

<style></style>
