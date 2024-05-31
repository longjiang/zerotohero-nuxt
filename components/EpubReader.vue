<template>
  <div class="epub-reader">
    <div class="text-right" v-if="book"><b-button @click="book = null" class="mb-1" size="sm" variant="dark"><i class="fas fa-times mr-1"></i> {{ $t('Close eBook') }}</b-button></div>
    <div class="upload-container" v-if="!book">
      <drop
        @drop="handleDrop"
        :class="{ over, 'drag-area': true }"
        @dragover="over = true"
        @dragleave="over = false"
      >
        <div class="icon"><i class="fas fa-cloud-upload-alt"></i></div>
        <p>
          {{
            $t("Choose an ebook (.epub) to open:")
          }}
        </p>
        <b-button @click="triggerFileInput" variant="primary" class="mt-3 upload-button">{{ $t('Browse') }}</b-button>
        <input type="file" hidden @change="openEpub($event.target.files[0])" ref="fileInput" />
      </drop>
    </div>
    <div v-else ref="book">
      <b-modal ref="tocModal" :title="$t('Table of Contents')" :hide-footer="true" size="md">
        <div class="toc-container">
          <TocItem v-for="(item, index) in toc" :key="index" :item="item" @load-chapter="loadChapter" />
        </div>
      </b-modal>
      <img v-if="coverUrl && !coverTapped" :src="coverUrl" alt="" class="book-cover" @click="coverTapped = true" />
      <div class="text-center mt-5 mb-5" v-if="loading">
        <Loader :sticky="true" />
      </div>
      <TextWithSpeechBar class="mt-3" v-if="!loading && currentChapterHTML && coverTapped" v-bind="{
          showTocButton: true,
          hasPreviousChapter,
          hasNextChapter,
          html: currentChapterHTML,
          page,
          key: `text-with-speech-bar-${epubFileName}-${currentChapterHref}-${page}`,
        }" ref="reader" @showTOC="onShowTOC" @previousPage="onPreviousPage" @nextPage="onNextPage" @goToPage="onGoToPage"
        @nextChapter="nextChapter" @prevChapter="previousChapter" />
    </div>
  </div>
</template>

<script>
import TextWithSpeechBar from "./TextWithSpeechBar.vue";
import { Drag, Drop } from "vue-drag-drop";

export default {
  components: {
    TextWithSpeechBar,
    Drag,
    Drop,
  },
  data() {
    return {
      book: null,
      loading: false,
      toc: [],
      currentChapterHref: null,
      prevChapterHref: null,
      nextChapterHref: null,
      currentChapterHTML: null,
      page: 1,
      epubFile: null,
      epubFileName: undefined,
      coverUrl: null,
      coverTapped: false,
      translation: null,
      over: false // Whether the user is dragging a file over the drop area
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
  watch: {
    epubFile() {
      this.openEpub(this.epubFile);
    },
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click(); // Access the file input via refs and trigger click
    },
    handleDrop(data, event) {
      event.preventDefault();
      let file = event.dataTransfer.files[0];
      this.openEpub(file);
      this.over = false;
    },
    onShowTOC() {
      this.$refs.tocModal.show();
    },
    onGoToPage(page) {
      this.page = page;
      this.$nuxt.$emit("scroll-to", {
        top: 0,
        behavior: "auto",
      });
    },
    onNextPage() {
      this.onGoToPage(this.page + 1);
    },
    onPreviousPage() {
      this.onGoToPage(this.page - 1);
    },
    async openEpub(file) {
      this.coverTapped = false;
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
        if (!this.coverUrl) {
          this.coverTapped = true;
        }
        if (this.toc.length > 0) {
          let firstChapter = this.toc[0];
          this.loadChapter(firstChapter.href);
        }
      } catch (error) {
        console.error("Error loading book:", error);
      }
    },

    // Load a specific chapter in an ePub document.

    async loadChapter(href) {
      this.loading = true;
      this.currentChapterHref = href;
      const cleanHref = href.split("#")[0];
      let spine = await this.book.loaded.spine;
      let tocHrefs = this.toc.map((item) => item.href);

      let { startIndex, endIndex } = this.getStartAndEndSpineIndexes(
        spine,
        cleanHref,
        tocHrefs
      );

      let concatenatedChapterHTML = await this.getConcatenatedChapterHTML(spine, startIndex, endIndex);

      // Filter the chapter HTML to only include the current chapter
      let chapterHTML = this.getFilteredChapterHTML(concatenatedChapterHTML, this.currentChapterHref, tocHrefs);

      // Only include the content of the body tag, and flatten any nested divs
      chapterHTML = this.normalizeHTML(chapterHTML);

      this.currentChapterHTML = chapterHTML;
      this.page = 1;
      if (this.$refs.tocModal) this.$refs.tocModal.hide();
      this.updateChapterNavigation();
      this.$nuxt.$emit("scroll-to", {
        top: 0,
        behavior: "smooth",
      })
      this.loading = false;
    },

    async getConcatenatedChapterHTML(spine, startIndex, endIndex) {
      let chapterHTML = "";

      for (let i = startIndex; i < endIndex; i++) {
        let item = spine.get(spine.items[i].href);
        let contents = await item.load(this.book.load.bind(this.book));
        chapterHTML += contents.innerHTML;
      }

      return chapterHTML;
    },

    getStartAndEndSpineIndexes(spine, cleanHref, tocHrefs) {
      let startIndex = spine.items.findIndex((item) => item.href === cleanHref);
      let endIndex = spine.items.findIndex(
        (item, index) =>
          index > startIndex &&
          tocHrefs.map((href) => href.split("#")[0]).includes(item.href)
      );

      endIndex = endIndex === -1 ? spine.items.length : endIndex;
      return { startIndex, endIndex };
    },


    getFilteredChapterHTML(concatenatedChapterHTML, currentHref, tocHrefs) {

      if (currentHref) {
        const { startFragmentId, endFragmentId } = this.getStartAndEndFragmentIds(
          currentHref,
          tocHrefs
        );


        if (startFragmentId || endFragmentId) {
          concatenatedChapterHTML = this.filterContentsByFragment(
            concatenatedChapterHTML,
            startFragmentId,
            endFragmentId
          );
        }
      }

      return this.updateImageURLs(concatenatedChapterHTML);
    },

    /**
     * Only include the content of the body tag, and flatten any nested divs
     * @param {string} chapterHTML
     */
    normalizeHTML(chapterHTML) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(chapterHTML, "text/html");

      const body = doc.getElementsByTagName("body")[0];

      if (!body) {
        return chapterHTML;
      }

      const newContainer = doc.createElement("div");

      // Flatten any nested divs
      for (const child of body.childNodes) {
        if (child.nodeName === "DIV") {
          for (const grandchild of child.childNodes) {
            newContainer.appendChild(grandchild.cloneNode(true));
          }
        } else {
          newContainer.appendChild(child.cloneNode(true));
        }
      }

      // Remove any none-displayed elements
      
      const hiddenElements = newContainer.querySelectorAll(
        "script, style, link, meta, title, head, noscript"
      );
      for (const el of hiddenElements) {
        el.remove();
      }

      return newContainer.innerHTML;
    },

    getCurrentHrefAndIndex(tocHrefs, itemHref) {
      const currentHref = tocHrefs.find((href) => href.startsWith(itemHref));
      const currentTocIndex = tocHrefs.findIndex(
        (tocHref) => tocHref === currentHref
      );

      return { currentHref, currentTocIndex };
    },

    getStartAndEndFragmentIds(currentHref, tocHrefs) {

      const startFragmentId =
        currentHref.indexOf("#") !== -1 ? currentHref.split("#")[1] : null;
      const currentTocIndex = tocHrefs.findIndex((tocHref) => tocHref === currentHref);
      const endFragmentId =
        currentTocIndex + 1 < tocHrefs.length
          ? tocHrefs[currentTocIndex + 1].split("#")[1]
          : null;

      return { startFragmentId, endFragmentId };
    },

    filterContentsByFragment(contents, startFragmentId, endFragmentId) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(contents, "text/html");

      const startElement = doc.getElementById(startFragmentId);
      const endElement = doc.getElementById(endFragmentId);

      const newContainer = doc.createElement("div");
      newContainer.className = "main";

      if (startElement) {
        let elementsBetween;
        if (endElement) {
          elementsBetween = this.getElementsBetweenIds(startElement, endElement);
        } else {
          elementsBetween = this.getElementsBetweenIds(startElement);
        }

        for (const el of elementsBetween) {
          newContainer.appendChild(el.cloneNode(true));
        }
      }

      const serializer = new XMLSerializer();
      const newContents = serializer.serializeToString(newContainer);

      return newContents;
    },




    getElementsBetweenIds(startElement, endElement) {
      let selector
      if (endElement) {
        selector = `:is(#${startElement.id}) ~ :not(#${endElement.id})`
      }
      else {
        selector = `:is(#${startElement.id}) ~ *`
      }
      const allElements = startElement.parentNode.querySelectorAll(selector);

      let elementsBetween = Array.from(allElements)

      if (endElement) {
        elementsBetween = elementsBetween
          .filter(
            (el) =>
              el.compareDocumentPosition(endElement) &
              Node.DOCUMENT_POSITION_PRECEDING
          );
      }

      elementsBetween.unshift(startElement);

      return elementsBetween;
    },

    updateImageURLs(chapterHTML) {
      // Load the chapter HTML into a DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(chapterHTML, "text/html");

      // Update the image URLs
      const updateImageSrc = (img, attributeName) => {
        const src = img.getAttribute(attributeName);
        const absoluteSrc = this.book.path.resolve(src);
        const urlCache = this.book.archive.urlCache;
        const absoluteUrl = urlCache[absoluteSrc];
        img.setAttribute(attributeName, absoluteUrl);
      };

      // Replace img src attributes with absolute URLs
      const imgElements = doc.getElementsByTagName("img");
      for (let i = 0; i < imgElements.length; i++) {
        updateImageSrc(imgElements[i], "src");
      }

      // Replace image xlink:href attributes with absolute URLs
      const imageElements = doc.getElementsByTagName("image");
      for (let i = 0; i < imageElements.length; i++) {
        updateImageSrc(imageElements[i], "xlink:href");
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

<style scoped lang="scss">
@import "~@/assets/scss/variables.scss";

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

body {
    font-family: 'Arial', sans-serif;
    background-color: #121212;
    color: white;
    margin: 0;
    padding: 20px;
}

.upload-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 20px;
    height: 100%;
}

.drag-area {
    border: 2px dashed #333; /* Dimmer border color */
    background-color: transparent;
    transition: all 0.3s ease-in-out;
    border-radius: 10px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    padding: 3rem;
}

/* Hover or drag-over state with brighter outline and subtle background */
.drag-area.over {
    border-color: $primary-color; /* Brighter border color */
    background-color: #1e1e1e; /* Subtle background color */
    .icon {
        color: $primary-color; /* Brighter icon color */
    }
}


.drag-area .icon {
    margin-bottom: 10px;
    font-size: 3rem;
    color: #333;
}

.drag-area p {
    margin: 5px 0;
}

.upload-button {
    width: 10rem;
}

</style>
