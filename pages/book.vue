<router>
  {
    path: '/:l1/:l2/book/:id/:title',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-4">
      <div class="row">
        <div class="col-sm-6 col-md-4 col-lg-3">
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
            </div>
          </div>
        </div>
        <div
          class="col-sm-12 col-md-8 col-lg-9 pt-3"
          v-if="bookData && filteredHtml"
        >
          <LazyTextWithSpeechBar :html="filteredHtml" />
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
      console.log(err);
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
    text-align: left;
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