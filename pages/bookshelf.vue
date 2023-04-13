<router>
  {
    path: '/:l1/:l2/bookshelf',
  }
</router>
<template>
  <div class="main books pt-5 pb-5">
    <container-query :query="query" v-model="params">
      <div class="container pb-5">
        <div class="row mb-4 p-2">
          <div class="col-sm-12 d-flex">
            <b-form-input
              class="mr-1 w-100"
              type="text"
              placeholder="Search my bookshelf"
              v-model="search"
              :lazy="true"
            />
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
              You don't have any books on your bookshelf.
            </div>
          </div>
        </div>
      </div>
    </container-query>
  </div>
</template>

<script>
import { ContainerQuery } from "vue-container-query";
import { mapState} from 'vuex';

export default {
  components: {
    ContainerQuery,
  },
  data() {
    return {
      search: undefined,
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
    ...mapState('bookshelf', ['items']),
    books() {
      return this.items
    },
  },
  created() {
    this.$store.dispatch('bookshelf/load')
  },
  watch: {
  },
  methods: {
    async getBooks() {
      
    },
  },
};
</script>

<style>
</style>