<router>
  {
    path: '/:l1/:l2/gutenberg/:id/:page?/:title?',
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
          <LazyTextWithSpeechBar
            :html="filteredHtml"
            :page="page"
            @previousPage="onPreviousPage"
            @nextPage="onNextPage"
          />
        </div>
        <div class="col-sm-12 col-lg-4 col-xl-3" style="">
          <div
            style="
              max-width: 15rem;
              margin: 1.5rem auto;
              position: sticky;
              top: 0.5rem;
              border: 1px solid #ddd;
              border-radius: 0.5rem;
              padding: 1rem;
            "
          >
            <div class="book-info" v-if="bookData">
              <div class="p-4">
                <router-link
                  :to="{
                    name: 'gutenberg',
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
              <div class="info text-center">
                <div class="title">{{ bookData.title }}</div>
                <div
                  class="author"
                  v-if="bookData.authors[0]"
                  :set="(author = bookData.authors[0])"
                >
                  {{ author.name }}
                </div>
                <div class="mt-3 mb-3">
                  <b-button variant="success" size="sm" @click="addToBookshelf" v-if="!saved">
                    <i class="fas fa-plus mr-1"></i>
                    Add to Bookshelf
                  </b-button>
                  <b-button variant="unstyled" v-else class="text-danger" @click="removeFromBookshelf"><i class="fas fa-minus-circle"></i> Remove</b-button>
                </div>
                <div>
                  <a
                    :href="bookData.formats['text/html']"
                    target="_blank"
                    class="text-secondary"
                  >
                    Read on Gutenberg
                  </a>
                </div>
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
import { mapState } from "vuex";

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
  watch: {
    items() {
      this.saved
    }
  },
  computed: {
    ...mapState("bookshelf", ["items"]),
    saved() {
      return this.$store.getters['bookshelf/has'](this.bookData)
    },
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
        parsed
          .querySelectorAll("img")
          .forEach((img) =>
            img.setAttribute(
              "src",
              this.bookData.formats["image/jpeg"].replace(/(.*)\/.*?$/, "$1/") +
                img.getAttribute("src")
            )
          );
        return parsed.querySelector("body").toString();
      }
    },
  },
  async created() {
    this.$store.dispatch('bookshelf/load')
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
  methods: {
    removeFromBookshelf() {
      this.$store.dispatch("bookshelf/remove", this.bookData);
    },
    addToBookshelf() {
      this.$store.dispatch("bookshelf/add", this.bookData);
    },
    onPreviousPage() {
      let to = {
        name: "gutenberg",
        params: {
          id: this.id,
          book: this.book,
          title: this.title,
          page: this.page ? Number(this.page) - 1 : undefined,
        },
      };
      this.$router.push(to);
    },
    onNextPage() {
      let to = {
        name: "gutenberg",
        params: {
          id: this.id,
          book: this.book,
          title: this.title,
          page: this.page ? Number(this.page) + 1 : undefined,
        },
      };
      this.$router.push(to);
    },
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
    padding: .75rem;
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