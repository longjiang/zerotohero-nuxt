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
      <TextWithSpeechBar v-if="currentChapterHTML" :html="currentChapterHTML" />
      <div class="chapter-navigation">
        <button @click="previousChapter" :disabled="!prevChapterHref">Previous</button>
        <button @click="nextChapter" :disabled="!nextChapterHref">Next</button>
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
        let spine = await this.book.loaded.spine
        this.book.loaded.spine.then((spine) => {
          spine.each((item) => {
            console.log({item})
            item.load(this.book.load.bind(this.book)).then((contents) => {
              console.log(contents);
            });
          });
        });
      } catch (error) {
        console.error("Error loading book:", error);
      }
    },
    async loadChapter(href) {
      console.log({href})
      this.currentChapterHref = href;

      try {
        const chapterDocument = await this.book.renderTo(this.$refs.bookContainer, {
        width: '100%',
        height: '100%',
      });
        console.log({chapterDocument})
        console.log("chapterDocument.documentElement", chapterDocument.documentElement)
        console.log(await chapterDocument.started )
        // this.currentChapterHTML = chapterDocument.documentElement.innerHTML;
      } catch (error) {
        console.error("Error loading chapter:", error);
      }

      // this.updateChapterNavigation();
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
      const currentIndex = spine.findIndex((item) => item.href === this.currentChapterHref);
      this.prevChapterHref = currentIndex > 0 ? spine[currentIndex - 1].href : null;
      this.nextChapterHref = currentIndex < spine.length - 1 ? spine[currentIndex + 1].href : null;
    },
  },
};
</script>

<style scoped>
.chapter-navigation {
  margin-top: 10px;
}
</style>