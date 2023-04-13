<router>
  {
    path: '/:l1/:l2/book/chapter',
    props: route => ({ args: route.query.url })
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5" id="book-chapter">
      <SocialHead
        v-if="chapter"
        :title="`${$l2.name} Guided Reader: ${book ? book.title + ' - ' : ''}${
          chapter.title
        } | Language Player`"
        :image="`${book.thumbnail ? book.thumbnail : '/img/books-1.png'}`"
        :description="`Annoated ${
          $l2.name
        } book with learning tools. The entire chapter: “${stripTags(
          chapter.content
        ).trim()}`"
      />
      <div class="row mb-5">
        <div class="col-sm-12">
          <SimpleSearch
            placeholder="Enter the URL of a book chapter from a variety of eBook websites"
            :action="
              (url) => {
                this.$router.push({
                  path: `/${$l1.code}/${
                    $l2.code
                  }/book/chapter?url=${encodeURIComponent(url)}`,
                });
              }
            "
            ref="search"
          />
        </div>
      </div>
      <div class="row">
        <div
          v-if="chapter"
          class="col-md-8"
          :key="'chapter-' + encodeURIComponent(chapter.title)"
        >
          <div
            v-if="!(chapter.content && chapter.content.length > 0)"
            class="text-center"
          >
            <Loader :sticky="true" />
          </div>
          <Annotate
            tag="h1"
            :foreign="foreign"
            :showTranslate="foreign"
            :buttons="true"
          >
            <span>{{ chapter.title }}</span>
          </Annotate>

          <div class="chapter-content" v-if="chapter.content">
            <client-only :placeholder="chapter.content">
              <LazyTextWithSpeechBar
                :lang="chapterLang ? chapterLang : $l2.code"
                :html="chapter.content"
                :foreign="foreign"
              />
            </client-only>
          </div>

          <b-button-group class="d-flex mb-5">
            <b-button variant="light" v-if="previous" @click="previousClick">
              <i class="fas fachevron-up mr-2"></i>
              Previous
            </b-button>
            <b-button variant="light" v-if="next" @click="nextClick">
              Next
              <i class="fas fachevron-down ml-2"></i>
            </b-button>
          </b-button-group>
        </div>

        <div
          v-if="book"
          class="col-md-4 text-center"
          :key="'book-' + book.title"
        >
          <client-only :placeholder="book.title">
            <router-link
              v-if="book.url"
              :to="
                book.url
                  ? `/${$l1.code}/${
                      $l2.code
                    }/book/index?url=${encodeURIComponent(book.url)}`
                  : false
              "
              class="link-unstyled"
            >
              <img
                :src="
                  book.thumbnail
                    ? `${Config.imageProxy}?${book.thumbnail}`
                    : `/img/book-thumb-${Math.floor(Math.random() * 10)}.jpg`
                "
                alt="Book cover"
                class="mb-4 shadow book-thumb"
                data-not-lazy
              />
              <Annotate v-if="book.title" :foreign="foreign" :buttons="false">
                <h6>
                  <em>{{ book.title }}</em>
                </h6>
                <p>{{ book.author }}</p>
              </Annotate>
            </router-link>
          </client-only>
          <client-only placeholder="Read the original">
            <div class="bg-light p-4 mb-3 rounded" v-if="source(args)">
              <a :href="args" class="link-unstyled" target="_blank">
                Read the original on
                <img
                  class="logo-small ml-2"
                  :src="source(args).logo($l2.code)"
                  :alt="source(args).name"
                />
              </a>
            </div>
          </client-only>
          <b-button-group class="d-flex mb-3">
            <b-button variant="light" v-if="previous" @click="previousClick">
              <i class="fas fachevron-up mr-2"></i>
            </b-button>
            <b-button variant="light" v-if="next" @click="nextClick">
              <i class="fas fachevron-down ml-2"></i>
            </b-button>
          </b-button-group>
          <div class="list-group text-left">
            <router-link
              v-for="(chapter, index) in book.chapters"
              :key="`book-chapter-${chapter.title}-${index}`"
              :to="`/${$l1.code}/${
                $l2.code
              }/book/chapter?url=${encodeURIComponent(chapter.url)}`"
              class="link-unstyled"
            >
              <Annotate
                :class="{
                  'list-group-item': true,
                  active:
                    $route.fullPath ===
                    `/${$l1.code}/${
                      $l2.code
                    }/book/chapter?url=${encodeURIComponent(chapter.url)}`,
                }"
                :foreign="foreign"
                :buttons="false"
              >
                <span>{{ chapter.title }}</span>
              </Annotate>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Library from "@/lib/library";
import Helper from "@/lib/helper";
import { parse } from "node-html-parser";
import sanitizeHtml from "sanitize-html";

export default {
  props: {
    method: {
      type: String,
    },
    args: {
      type: String,
    },
  },
  data() {
    return {
      Config,
      book: undefined,
      chapter: undefined,
      chapterLang: undefined,
      foreign: true,
    };
  },
  computed: {
    previous() {
      if (this.chapters) {
        let index = this.chapters.findIndex(
          (chapter) => chapter.url === this.args
        );
        if (index && index > 0 && this.chapters[index - 1]) {
          return this.chapters[index - 1].url;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    next() {
      let next = false;
      if (this.chapters) {
        let index = this.chapters.findIndex(
          (chapter) => chapter.url === this.args
        );
        if (
          index !== undefined &&
          index < this.chapters.length - 1 &&
          this.chapters[index + 1]
        ) {
          next = this.chapters[index + 1].url;
        }
      }
      return next;
    },
  },
  mounted() {
    let url = decodeURIComponent(this.args);
    if (this.$refs.search) this.$refs.search.text = url;
  },
  watch: {
    args() {
      this.getChapter();
      if (this.$refs.search) this.$refs.search.text = this.args;
    },
  },
  async created() {
    await this.getChapter();
  },
  methods: {
    async getChapter() {
      let url = decodeURIComponent(this.args);
      try {
        let libraryL2 = await(
          await import(`@/lib/library-l2s/library-${this.$l2["iso639-3"]}.js`)
        ).default;
        await Library.setLangSources(libraryL2.sources);
      } catch (err) {
        console.log(`Booklists for ${this.$l2["iso639-3"]} is unavailable.`);
      }
      let chapter = await Library.getChapter(url);
      if (chapter) {
        let root = parse("<div></div>");
        root.innerHTML = sanitizeHtml(chapter.content);
        for (let a of root.querySelectorAll("a")) {
          if (!a.getAttribute("target")) {
            let url = a.getAttribute("href");
            a.setAttribute(
              "href",
              `/${this.$l1.code}/${
                this.$l2.code
              }/book/chapter?url=${encodeURIComponent(url)}`
            );
          }
        }
        chapter.content = root.innerHTML;
        if (chapter.lang && chapter.lang === this.$l1.code) {
          this.foreign = false;
        } else {
          this.foreign = true;
        }
        this.chapter = chapter;
        if (chapter.book) {
          this.book = this.chapter.book;
        }
      }
    },
    stripTags(t) {
      return Helper.stripTags(t);
    },
    source(a) {
      return Library.source(a);
    },
    previousClick() {
      this.$router.push({
        path: `/${this.$l1.code}/${
          this.$l2.code
        }/book/chapter?url=${encodeURIComponent(this.previous)}`,
      });
    },
    nextClick() {
      this.$router.push({
        path: `/${this.$l1.code}/${
          this.$l2.code
        }/book/chapter?url=${encodeURIComponent(this.next)}`,
      });
    },
  },
};
</script>

<style lang="scss">
.chapter-content {
  img {
    max-width: 100%;
    height: auto;
  }
}
</style>
