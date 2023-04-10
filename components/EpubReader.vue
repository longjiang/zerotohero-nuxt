<template>
  <div class="epub-reader">
    <input type="file" @change="openEpub" accept=".epub" />
    <div ref="bookContainer" class="book-container"></div>
    <div v-if="book">
      <b-modal ref="tocModal" title="Table of Contents" size="lg">
        <ul>
          <li v-for="(item, index) in toc" :key="index">
            <a href="#" @click.prevent="loadChapter(item.href)">{{
              item.label
            }}</a>
          </li>
        </ul>
      </b-modal>
      <TextWithSpeechBar
        class="mt-3"
        v-if="currentChapterHTML"
        :key="`text-with-speech-bar-${epubFileName}-${currentChapterHref}-${page}`"
        :html="currentChapterHTML"
        :page="page"
        :showTocButton="true"
        @showTOC="onShowTOC"
        @previousPage="onPreviousPage"
        @nextPage="onNextPage"
        @goToPage="onGoToPage"
      />
      <div class="chapter-navigation">
        <button @click="previousChapter" :disabled="!prevChapterHref">
          {{ $t("Previous") }}
        </button>
        <button @click="nextChapter" :disabled="!nextChapterHref">
          {{ $t("Next") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import TextWithSpeechBar from "./TextWithSpeechBar.vue";

export default {
  components: {
    TextWithSpeechBar,
  },
  data() {
    return {
      book: null,
      toc: [],
      currentChapterHref: null,
      prevChapterHref: null,
      nextChapterHref: null,
      currentChapterHTML: null,
      page: 1,
      epubFileName: undefined
    };
  },
  head() {
    let head = {};
    head.script = [
      {
        hid: "jszip",
        src: "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js", // v0.3.88
      },
      {
        hid: "epubjs",
        src: "/vendor/epubjs/epub.min.js", // v0.3.88
      },
    ];
    return head;
  },
  mounted() {
    // this.openEpub();
  },
  methods: {
    onShowTOC() {
      this.$refs.tocModal.show();
    },
    onGoToPage(page) {
      this.page = page;
    },
    onNextPage() {
      this.page = this.page + 1;
    },
    onPreviousPage() {
      this.page = this.page - 1;
    },
    async openEpub(event) {
      const file = event.target.files[0];
      if (!file) return;
      this.epubFileName = file.name;

      try {
        const epubData = await new Promise((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = () => resolve(fileReader.result);
          fileReader.onerror = () => reject(fileReader.error);
          fileReader.readAsArrayBuffer(file);
        });

        this.book = ePub(epubData);
        let navigation = await this.book.loaded.navigation;
        this.toc = navigation.toc;
        if(this.toc.length > 0) {
          let firstChapter = this.toc[0]
          this.loadChapter(firstChapter.href)
        }
      } catch (error) {
        console.error("Error loading book:", error);
      }
    },
    async loadChapter(href) {
      this.currentChapterHref = href;
      let spine = await this.book.loaded.spine;
      let item = spine.get(href);
      let contents = await item.load(this.book.load.bind(this.book));
      this.currentChapterHTML = contents.innerHTML;

      this.updateChapterNavigation();
    },
    previousChapter() {
      if (this.prevChapterHref) {
        this.loadChapter(this.prevChapterHref);
      }
    },
    nextChapter() {
      if (this.nextChapterHref) {
        this.loadChapter(this.nextChapterHref);
      }
    },
    updateChapterNavigation() {
      const spine = this.book.spine.spineItems;
      const currentIndex = spine.findIndex(
        (item) => item.href === this.currentChapterHref
      );
      this.prevChapterHref =
        currentIndex > 0 ? spine[currentIndex - 1].href : null;
      this.nextChapterHref =
        currentIndex < spine.length - 1 ? spine[currentIndex + 1].href : null;
    },
  },
};
</script>

<style scoped>
.chapter-navigation {
  margin-top: 10px;
}
</style>
