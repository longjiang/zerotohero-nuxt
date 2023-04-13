<template>
  <div class="epub-reader">
    <input type="file" @change="openEpub" accept=".epub" />
    <div v-if="book" ref="book">
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
      <img
        v-if="coverUrl && !coverTapped"
        :src="coverUrl"
        alt=""
        class="book-cover"
        @click="coverTapped = true"
      />
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
        ref="reader"
        @showTOC="onShowTOC"
        @previousPage="onPreviousPage"
        @nextPage="onNextPage"
        @goToPage="onGoToPage"
        @nextChapter="nextChapter"
        @previousChapter="previousChapter"
      />
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
        src: "/vendor/jszip/jszip.min.js", // v3.10.1
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
      if (window) window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onNextPage() {
      this.onGoToPage(this.page + 1);
    },
    onPreviousPage() {
      this.onGoToPage(this.page - 1);
    },
    async openEpub(event) {
      this.coverTapped = false;
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

      const cleanHref = href.split("#")[0];

      let spine = await this.book.loaded.spine;
      let tocHrefs = this.toc.map((item) => item.href);

      let startIndex = spine.items.findIndex((item) => item.href === cleanHref);
      let endIndex = spine.items.findIndex(
        (item, index) =>
          index > startIndex &&
          tocHrefs.map((href) => href.split("#")[0]).includes(item.href)
      );

      endIndex = endIndex === -1 ? spine.items.length : endIndex;

      let chapterHTML = "";
      for (let i = startIndex; i < endIndex; i++) {
        let item = spine.get(spine.items[i].href);
        let contents = await item.load(this.book.load.bind(this.book));

        const currentHref = tocHrefs.find((href) => href.startsWith(item.href));
        const currentTocIndex = tocHrefs.findIndex(
          (tocHref) => tocHref === currentHref
        );

        let filteredContents = contents.innerHTML;

        if (currentHref) {
          const startIndex =
            currentHref.indexOf("#") !== -1 ? currentHref.split("#")[1] : null;
          const endIndex =
            currentTocIndex + 1 < tocHrefs.length
              ? tocHrefs[currentTocIndex + 1].split("#")[1]
              : null;

          if (startIndex || endIndex) {
            filteredContents = this.filterContentsByFragment(
              contents.innerHTML,
              startIndex,
              endIndex
            );
          }
        }

        chapterHTML += this.updateImageURLs(filteredContents);
      }

      this.currentChapterHTML = chapterHTML;
      this.page = 1;
      this.$refs.tocModal.hide();
      this.updateChapterNavigation();
      if (window) window.scrollTo({ top: 0, behavior: "smooth" });
    },
    filterContentsByFragment(contents, startFragment, endFragment) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(contents, "text/html");

      const startElement = doc.getElementById(startFragment);
      const endElement = doc.getElementById(endFragment);

      if (startElement && endElement) {
        const allElements = Array.from(
          doc.body.querySelectorAll(`#${startElement.id} ~ *`)
        );
        const elementsBetween = this.getElementsBetweenIds(
          startElement,
          endElement
        );

        let elementsToRemove = [];

        for (const el of allElements) {
          if (!elementsBetween.includes(el)) {
            let notAncestor =
              !el.contains(startElement) && !el.contains(endElement);
            if (notAncestor) {
              elementsToRemove.push(el);
            }
          }
        }

        for (const el of elementsToRemove) {
          el.remove();
        }
      }

      const serializer = new XMLSerializer();
      return serializer.serializeToString(doc.body);
    },

    getElementsBetweenIds(startElement, endElement) {
      const allElements = startElement.parentNode.querySelectorAll(
        `:is(#${startElement.id}) ~ :not(#${endElement.id})`
      );

      const elementsBetween = Array.from(allElements).filter(
        (el) =>
          el.compareDocumentPosition(endElement) &
          Node.DOCUMENT_POSITION_FOLLOWING
      );

      elementsBetween.unshift(startElement);

      return elementsBetween;
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
