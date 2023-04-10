<template>
  <div class="epub-reader">
    <input type="file" @change="openEpub" accept=".epub" />
    <div ref="bookContainer" class="book-container"></div>
    <div v-if="book">
      <b-modal
        ref="tocModal"
        :title="$t('Table of Contents')"
        :hide-footer="true"
        size="md"
      >
        <div class="toc-container">
          <TocItem
            v-for="(item, index) in toc"
            :key="index"
            :item="item"
            @load-chapter="loadChapter"
          />
        </div>
      </b-modal>
      <img v-if="coverUrl && !coverTapped" :src="coverUrl" alt="" class="book-cover" @click="coverTapped = true" />
      <TextWithSpeechBar
        class="mt-3"
        v-if="currentChapterHTML && coverTapped"
        v-bind="{
          showTocButton: true,
          hasPreviousChapter,
          hasNextChapter,
          html: currentChapterHTML,
          page,
          key: `text-with-speech-bar-${epubFileName}-${currentChapterHref}-${page}`,
        }"
        @showTOC="onShowTOC"
        @previousPage="onPreviousPage"
        @nextPage="onNextPage"
        @goToPage="onGoToPage"
        @nextChapter="nextChapter"
        @previousChapter="previousChapter"
      />
      <div class="chapter-navigation text-center">
        <button
          @click="previousChapter"
          :disabled="!hasPreviousChapter"
          class="btn btn-secondary"
        >
          <i class="fas fa-step-backward mr-1"></i>
        </button>
        <button
          @click="nextChapter"
          :disabled="!hasNextChapter"
          class="btn btn-secondary"
        >
          <i class="fas fa-step-forward ml-1"></i>
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
      epubFileName: undefined,
      coverUrl: null,
      coverTapped: false,
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
  computed: {
    hasPreviousChapter() {
      return (
        this.getPrevChapterHref(this.toc, this.currentChapterHref) !== null
      );
    },

    hasNextChapter() {
      return (
        this.getNextChapterHref(this.toc, this.currentChapterHref) !== null
      );
    },
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
      this.coverTapped = false
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
        this.coverUrl = await this.book.coverUrl();
        if (this.toc.length > 0) {
          let firstChapter = this.toc[0];
          this.loadChapter(firstChapter.href);
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
      this.currentChapterHTML = this.updateImageURLs(contents.innerHTML);
      this.$refs.tocModal.hide();
      this.updateChapterNavigation();
    },
    updateImageURLs(chapterHTML) {
      // Load the chapter HTML into a DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(chapterHTML, "text/html");

      // Update the image URLs
      const images = doc.getElementsByTagName("img");
      // Replace image src attributes with absolute URLs
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const src = img.getAttribute("src");
        const absoluteSrc = this.book.path.resolve(src);
        const urlCache = this.book.archive.urlCache;
        const absoluteUrl = urlCache[absoluteSrc];
        img.setAttribute("src", absoluteUrl);
      }

      // Serialize the DOM back to a string
      const serializer = new XMLSerializer();
      return serializer.serializeToString(doc.documentElement);
    },

    async previousChapter() {
      const prevHref = this.getPrevChapterHref(
        this.toc,
        this.currentChapterHref
      );
      if (prevHref) {
        await this.loadChapter(prevHref);
      }
    },

    async nextChapter() {
      const nextHref = this.getNextChapterHref(
        this.toc,
        this.currentChapterHref
      );
      if (nextHref) {
        await this.loadChapter(nextHref);
      }
    },

    getPrevChapterHref(toc, currentHref, previous = null) {
      for (const item of toc) {
        if (item.href === currentHref) {
          return previous;
        }

        if (item.subitems && item.subitems.length) {
          const found = this.getPrevChapterHref(
            item.subitems,
            currentHref,
            item.href
          );
          if (found) {
            return found;
          }
        }

        previous = item.href;
      }

      return null;
    },

    getNextChapterHref(toc, currentHref, foundCurrent = false) {
      for (const item of toc) {
        if (foundCurrent) {
          return item.href;
        }

        if (item.href === currentHref) {
          foundCurrent = true;
        }

        if (item.subitems && item.subitems.length) {
          const found = this.getNextChapterHref(
            item.subitems,
            currentHref,
            foundCurrent
          );
          if (found) {
            return found;
          }
        }
      }

      return null;
    },
    updateChapterNavigation() {
      const spine = this.book.spine.spineItems;
      const currentIndex = spine.findIndex(
        (item) => item.href === this.currentChapterHref
      );
      this.prevChapterHref =
        currentIndex > 1 ? spine[currentIndex - 1].href : null; // The spine is 1-indexed
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

:deep(.modal-body) {
  padding: 0;
}

.book-cover {
  cursor: pointer;
  max-width: 100%;
  max-height: calc(100vh - 10rem);
  margin: 3rem auto;
  display: block;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
}
</style>
