<template>
  <div class="epub-reader">
    <input type="file" @change="openEpub" accept=".epub" />
    <div ref="bookContainer" class="book-container"></div>
    <div v-if="book">
      <h2>Table of Contents</h2>
      <ol>
        <li v-for="(item, index) in toc" :key="index">
          <button @click="loadChapter(item.href)">{{ item.label }}</button>
        </li>
      </ol>
      <TextWithSpeechBar
        v-if="currentChapterHTML"
        :html="currentChapterHTML"
        :page="page"
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
    onGoToPage(page) {
      this.page = page
    },
    onNextPage() {
      this.page = this.page + 1
    },
    onPreviousPage() {
      this.page = this.page - 1
    },
    async openEpub(event) {
      const file = event.target.files[0];
      if (!file) return;

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
