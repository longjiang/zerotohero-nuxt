<router>
  {
    path: '/:l1/:l2/book/:id/:page?/:title?',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-4 pb-5">
      <div class="row">
        <div
          class="col-sm-12 col-lg-8 col-xl-9 pt-3 pb-5"
          v-if="bookData && filteredHtml"
        >
          <LazyTextWithSpeechBar :html="filteredHtml" :page="page" />

          <div class="mt-5 text-center d-flex">
            <router-link
              v-if="Number(page) > 1"
              class="btn btn-success btn-lg d-block w-100 mr-1 flex-1"
              :to="{
                name: 'book',
                params: {
                  id,
                  book,
                  title,
                  page: page ? Number(page) - 1 : undefined,
                },
              }"
            >
              <i class="fas fa-chevron-left"></i>
            </router-link>
            <router-link
              class="btn btn-success btn-lg w-100 d-block ml-1 flex-1"
              :to="{
                name: 'book',
                params: {
                  id,
                  book,
                  title,
                  page: page ? Number(page) + 1 : undefined,
                },
              }"
            >
              Next Page
              <i class="fas fa-chevron-right ml-1"></i>
            </router-link>
          </div>
        </div>
        <div class="col-sm-12 col-lg-4 col-xl-3" style="border: 1px solid #ddd; border-radius: 0.5rem; padding: 1rem;">
          <div style="max-width: 15rem; margin: 0 auto;">
            <div class="book-info" v-if="bookData">
              <div class="p-4">
                <router-link
                  :to="{
                    name: 'book',
                    params: { id: bookData.id, title: bookData.title, book },
                  }"
                  class="three-to-two-aspect-wrapper shadow d-block"
                >
                  <img
                    :src="bookData.formats['image/jpeg']"
                    alt="Book cover"
                    class="book-cover aspect"
                  />
                </router-link>
              </div>
              <div class="info">
                <div class="title">{{ bookData.title }}</div>
                <div
                  class="author"
                  v-if="bookData.authors[0]"
                  :set="(author = bookData.authors[0])"
                >
                  {{ author.name }}
                </div>
                <a
                  :href="bookData.formats['text/html']"
                  target="_blank"
                  class="btn btn-sm mt-3 btn-gray"
                >
                  Gutenberg
                  <i class="fas fa-chevron-right ml-1"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Helper from "@/lib/helper";
import { parse } from "node-html-parser";

export default {
  props: {
    id: [Number, String],
    book: Object,
    title: String,
    page: {
      type: [Number, String],
      default: 1,
    },
  },
  data() {
    return { bookData: this.book, html: undefined };
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
    filteredHtml() {
      if (this.html) {
        let parsed = parse(this.html);
        parsed.querySelectorAll('img').forEach(img => img.setAttribute('src', this.bookData.formats["image/jpeg"].replace(/(.*)\/.*?$/, '$1/') + img.getAttribute('src')))
        return parsed.querySelector("body").toString();
      }
    },
  },
  async created() {
    try {
      if (!this.bookData) {
        let res = await axios.get(`http://gutendex.com/books/${this.id}`);
        if (res && res.data) {
          let bookData = res.data;
          this.bookData = bookData;
        }
      }
      if (this.bookData.formats["text/html"]) {
        let html = await Helper.proxy(this.bookData.formats["text/html"]);
        if (html) this.html = html;
      }
    } catch (err) {
      Helper.logError(err);
    }
  },
};
</script>

<style lang="scss" scoped>
.book-info {
  height: 100%;
  .book-cover {
    width: 100%;
    border-radius: 0.25rem;
  }
  .info {
    padding: 1.5rem;
    color: black;
    .title {
      font-weight: bold;
    }
    .author {
      margin-top: 0.2rem;
      color: #999;
      font-size: 0.9em;
    }
  }
}
</style>