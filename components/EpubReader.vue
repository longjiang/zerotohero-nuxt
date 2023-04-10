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
      <!-- <img v-if="coverUrl" :src="coverUrl" alt="" /> -->
      <!-- <div v-html="currentChapterHTML" class="chapter-container mt-3"></div> -->
      <TextWithSpeechBar
        class="mt-3"
        v-if="currentChapterHTML"
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
        @nextChapter="goToNextChapter"
        @previousChapter="goToPreviousChapter"
      />
      <div class="chapter-navigation text-center">
        <button
          @click="goToPreviousChapter"
          :disabled="!hasPreviousChapter"
          class="btn btn-secondary"
        >
          <i class="fas fa-step-backward mr-1"></i>
        </button>
        <button
          @click="goToNextChapter"
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
      coverUrl: null,
      currentChapterHref: null,
      currentChapterHTML: null,
      page: 1,
      epubFileName: undefined,
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
          this.loadChapter("cover");
        }
      } catch (error) {
        console.error("Error loading book:", error);
      }
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
    async loadChapter(href) {
      console.log('Loading', {href})
      // Treat the cover as a "chapter"
      // If the href is "cover", load the cover image
      if (href === "cover") {
        this.currentChapterHTML = `<img src="${this.coverUrl}" alt="Cover Image">`;
        this.currentChapterHref = "cover";
        this.$refs.tocModal.hide();
        return;
      }
      // Remove the hash (fragment identifier) from the href
      // The hash is used to identify the page number in books that are read right-to-left (e.g. Japanese)
      const cleanHref = href.split("#")[0];
      this.currentChapterHref = cleanHref;

      // Load the spine of the book and get the linear spine items (items that are part of the main reading flow)
      const spine = await this.book.loaded.spine;
      const linearItems = spine.spineItems.filter((item) => item.linear);

      // Find the index of the current spine item in the linear spine items array
      let currentSpineIndex = linearItems.findIndex(
        (item) => item.href === cleanHref
      );
      let chapterHTML = "";

      // Load the current spine item and all following spine items in the same chapter
      // This is done to concatenate the content of spine items in the same chapter (e.g. right-to-left books)
      while (
        currentSpineIndex < linearItems.length &&
        linearItems[currentSpineIndex].properties["rendition:layout"] !==
          "pre-paginated"
      ) {
        const currentItem = linearItems[currentSpineIndex];
        const contents = await currentItem.load(this.book.load.bind(this.book));
        chapterHTML += contents.innerHTML;
        currentItem.unload(); // Unload the spine item after using its contents to free up memory

        currentSpineIndex++;
      }

      // Update the image URLs
      this.currentChapterHTML = this.updateImageURLs(chapterHTML);
      this.$refs.tocModal.hide(); // Hide the Table of Contents modal
    },

    async goToPreviousChapter() {
      const prevHref = this.getPrevChapterHref(
        this.toc,
        this.currentChapterHref
      );
      if (prevHref) {
        await this.loadChapter(prevHref);
      }
    },

    async goToNextChapter() {
      const nextHref = this.getNextChapterHref(
        this.toc,
        this.currentChapterHref
      );
      if (nextHref) {
        await this.loadChapter(nextHref);
      }
    },

    getPrevChapterHref(toc, currentHref, previous = null) {
      if (currentHref === "cover") {
        return null;
      }
      if (previous === null) {
        return "cover";
      }
      for (const item of toc) {
        if (item.href === currentHref) {
          return previous;
        }

        const cleanItemHref = item.href.split("#")[0];
        if (cleanItemHref === currentHref) {
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
      console.log({toc, currentHref, foundCurrent})
      if (currentHref === "cover") {
        return toc[0].href.split("#")[0];
      }
      for (const item of toc) {
        if (foundCurrent) {
          return item.href;
        }
        const cleanItemHref = item.href.split("#")[0];
        if (cleanItemHref === currentHref) {
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
</style>
