<router>
  {
    path: '/:l1/:l2/book/chapter',
    props: route => ({ args: route.query.url }),
    meta: {
      title: 'Book Chapter | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content:
            'Read free, open books with hover dictionary and save new words for review.'
        }
      ]
    }
  }
</router>
<template>
  <div class="container main pt-5 pb-5" id="book-chapter">
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
    <div class="row" v-if="loaded">
      <div
        class="col-md-8"
        :key="'chapter-' + encodeURIComponent(chapterTitle)"
      >
        <div
          v-if="!(chapterContent && chapterContent.length > 0)"
          class="text-center"
        >
          <Loader :sticky="true" />
        </div>
        <Annotate tag="h1" :foreign="foreign" :showTranslate="foreign">
          <span>{{ chapterTitle }}</span>
        </Annotate>
        <div class="chapter-content" v-if="chapterContent">
          <SpeechBar
            :lang="chapterLang ? chapterLang : $l2.code"
            :html="chapterContent"
            :foreign="foreign"
          />
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
      <div class="col-md-4 text-center" :key="'book-' + bookTitle">
        <a
          :href="
            bookURL
              ? `/${$l1.code}/${$l2.code}/book/index?url=${encodeURIComponent(
                  bookURL
                )}`
              : false
          "
          class="link-unstyled"
        >
          <img
            :src="
              bookThumbnail
                ? `${Config.imageProxy}?${bookThumbnail}`
                : `/img/book-thumb-${Math.floor(Math.random() * 10)}.jpg`
            "
            alt="Book cover"
            class="mb-4 shadow book-thumb"
          />
          <Annotate v-if="bookTitle" :foreign="foreign">
            <h6>
              <em>{{ bookTitle }}</em>
            </h6>
            <p>{{ bookAuthor }}</p>
          </Annotate>
        </a>
        <div class="bg-light p-4 mb-3 rounded" v-if="Library.source(args)">
          <a :href="args" class="link-unstyled" target="_blank">
            Read the original on
            <img
              class="logo-small ml-2"
              :src="Library.source(args).logo($l2.code)"
              :alt="Library.source(args).name"
            />
          </a>
        </div>
        <b-button-group class="d-flex mb-3">
          <b-button variant="light" v-if="previous" @click="previousClick">
            <i class="fas fachevron-up mr-2"></i>
          </b-button>
          <b-button variant="light" v-if="next" @click="nextClick">
            <i class="fas fachevron-down ml-2"></i>
          </b-button>
        </b-button-group>
        <div class="list-group text-left">
          <Annotate
            tag="a"
            v-for="chapter in chapters"
            :class="{
              'list-group-item': true,
              'link-unstyled': true,
              active:
                location.pathname ===
                `/${$l1.code}/${$l2.code}/book/chapter?url=${encodeURIComponent(
                  chapter.url
                )}`,
            }"
            :foreign="foreign"
            :href="`/${$l1.code}/${
              $l2.code
            }/book/chapter?url=${encodeURIComponent(chapter.url)}`"
          >
            <span>{{ chapter.title }}</span>
          </Annotate>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Library from "@/lib/library";
import SimpleSearch from "@/components/SimpleSearch";
import SpeechBar from "@/components/SpeechBar";

export default {
  props: {
    method: {
      type: String,
    },
    args: {
      type: String,
    },
  },
  components: {
    SimpleSearch,
    SpeechBar,
  },
  data() {
    return {
      Config,
      Library,
      bookThumbnail: undefined,
      bookTitle: "",
      bookAuthor: "",
      bookURL: "",
      libraryL2: undefined,
      chapters: [],
      chapterTitle: "",
      chapterContent: "",
      chapterLang: undefined,
      location,
      foreign: true,
      loaded: false,
    };
  },
  watch: {
    args() {
      this.updateURL();
    },
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
  methods: {
    async updateURL() {
      let url = decodeURIComponent(this.args);
      this.$refs.search.text = url;
      this.chapterTitle = "";
      this.chapterContent = "";
      try {
        this.libraryL2 = await (
          await import(`@/lib/library-l2s/library-${this.$l2["iso639-3"]}.js`)
        ).default;
        await Library.setLangSources(this.libraryL2.sources);
      } catch (err) {
        console.log(`Booklists for ${this.$l2["iso639-3"]} is unavailable.`);
      }
      let chapter = await Library.getChapter(url);
      if (chapter) {
        this.chapterTitle = chapter.title;
        let $chapterContent = $("<div>").html(chapter.content);
        for (let a of $chapterContent.find("a")) {
          if (!$(a).attr("target")) {
            let url = $(a).attr("href");
            $(a).attr(
              "href",
              `/${this.$l1.code}/${
                this.$l2.code
              }/book/chapter?url=${encodeURIComponent(url)}`
            );
          }
        }
        this.chapterContent = $chapterContent.html();
        if (chapter.lang && chapter.lang === this.$l1.code) {
          this.foreign = false;
        } else {
          this.foreign = true;
        }
        if (chapter.book) {
          this.chapters = chapter.book.chapters;
          this.bookThumbnail = chapter.book.thumbnail;
          this.bookTitle = chapter.book.title;
          this.bookAuthor = chapter.book.author;
          this.bookURL = chapter.book.url;
        }
        this.chapterLang = chapter.lang;
      }
      this.loaded = true;
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
  async mounted() {
    this.updateURL();
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
