<template>
  <div v-if="chapter" class="chapter">
    <h1 class="mt-3 mb-3">{{ chapter.title }}</h1>
    <MediaBar
      ref="mediaBar"
      :article="chapter"
      type="bible-chapter"
      @verseNavPrev="goToPreviousVerse"
      @verseNavNext="goToNextVerse"
      @toggleMaximizeAllRefs="toggleMaximizeAllRefs"
      @loadRefs="loadRefs"
      @refStatusClick="refStatusClick"
    />
    <div class="scripture-processor-result" ref="result">
      <LazyTemplate
        v-if="contentHtml && studyElem"
        :studyElem="studyElem"
        :template="`<article class='wol-article'>${contentTemplate()}</article>`"
        ref="template"
      />
    </div>
  </div>
</template>

<script>
import langData from "@/lib/jw/languages/en-US";
import Config from "@/lib/Config";
import Helper from "@/lib/Helper";
import Wol from "@/lib/jw/Wol";
import $ from "jquery";

export default {
  props: ["bibleId", "bookId", "chapterId"],
  data() {
    return {
      chapter: undefined,
      book: undefined,
      contentHtml: "",
      hiddenInputsHtml: "",
      url: "",
      startVerse: 1,
      endVerse: undefined,
      topics: [], // titles of insight articles seen,
      initialized: false,
      presentationEnhanced: false,
      currentVerse: 1,
      placeNames: [],
      places: [],
      processFootnotesToggle: true,
      seenPublicationUrls: [],
      seenImages: [], // Don't display the same images over and over
      seenVids: [],
      seenScanUrls: [],
      mediaSnippets: [],
      presentationEnhanced: false,
      referencesLoaded: false,
    };
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    mediaBar() {
      return this.$refs.mediaBar;
    },
    player() {
      return this.$refs.mediaBar.$refs.player;
    },
    id() {
      return this.chapterId;
    },
    resultElem() {
      return this.$refs.template ? this.$refs.template.$el : undefined;
    },
    articleAudio() {
      return this.$refs.mediaBar ? this.$refs.mediaBar.$refs.player : undefined;
    },
    studyHtml() {
      return this.chapter
        ? this.chapter.htmlParsed.querySelector("#studyDiscover").innerHTML
        : undefined;
    },
    studyElem() {
      return this.chapter
        ? this.chapter.htmlParsed.querySelector("#studyDiscover")
        : undefined;
    },
  },
  async mounted() {
    this.book = langData.books[this.bookId - 1];
    this.bible = langData.bibles[this.bibleId - 1];
    this.topics = [this.book.name];
    this.url =
      Wol.baseUrl + "/" + langData.bibles[0].url + this.bookId + "/" + this.id;
    let html = await this.loadChapter();
    await this.loadFromHtmlPage(html);
    this.loadStudyDiscoverFromFullChapterHtml(html);
  },
  async updated() {
    if (this.$refs.mediaBar && this.$refs.template && !this.initialized) {
      await Helper.timeout(500); // so that the template is fully loaded
      this.enhancePresentation();
      this.$refs.mediaBar.chapter = this;
      this.$refs.mediaBar.loadAudio();
      // Trigger verse highlighting
      this.activateClickVerseToPlay();
      this.activateClickVerseNumToLoadReference();
      this.initialized = true;
    }
  },
  methods: {
    contentTemplate() {
      let node = this.chapter.contentParsed;
      if (!this.referencesLoaded) {
        this.referencesLoaded = true;
        for (let verseNum = 1; verseNum < this.endVerse; verseNum++) {
          let verseSpans = this.getSpansOfVerseFromNode(verseNum, node);
          let lastSpan = verseSpans[verseSpans.length - 1];
          let id = lastSpan.getAttribute("id")
          let vx = verseSpans[0].querySelector(".vx")
          let vxHref = vx ? vx.getAttribute("href") : undefined;
          lastSpan.innerHTML += `<BibleVerseReferences id="${id}" vx="${vxHref}" :studyElem="studyElem" ref='bibleVerseReferences' />`;
        }
      }
      let contentTemplate = node.innerHTML;
      return contentTemplate;
    },

    getSpansOfVerseFromNode(verseNum, node) {
      let spans = node.querySelectorAll(
        `.v[id^=v${this.bookId}-${this.chapterId}-${verseNum}-]`
      );
      return spans;
    },

    attachToVerse(element, verseNum, type = "publication-references") {
      let chapter = this;
      let articleSnippetsWrapper;
      if (!chapter.verseHasReference(verseNum, [type])) {
        articleSnippetsWrapper = $(`<ul class="${type}"></ul>`)[0];
        chapter.getLastSpanOfVerse(verseNum).after(articleSnippetsWrapper);
      } else {
        articleSnippetsWrapper = chapter.getVerseReferences(verseNum, type);
      }
      $(articleSnippetsWrapper).append(element);
      chapter.addCollapseButtonIfNeeded(articleSnippetsWrapper);
    },

    getLastSpanOfVerse(verseNum, node = this.resultElem) {
      return $(this.resultElem)
        .find(`.v[id^=v${this.bookId}-${this.chapterId}-${verseNum}-]`)
        .last()[0];
    },

    toggleMaximizeAllRefs() {
      this.$refs.template.toggleMaximizeAllRefs();
    },
    loadRefs() {
      this.$refs.template.expandAllJWAnchors();
    },
    refStatusClick() {},
    currentMarker(vid) {
      if (Number(vid.replace(/v.*-(\d+)-.*/, "$1")) === this.currentVerse) {
        return true;
      }
    },
    async loadChapter() {
      this.chapter = await Wol.getBibleChapter(this.bookId, this.id, this.$l2);
      return this.chapter.html;
    },

    loadFromHtmlPage(html) {
      var $article = $(html).find("#article");
      $article.find(".pswp").remove();
      this.loadFromHtml($article.html());
    },

    loadFromHtml(html) {
      const $html = $(html);

      const startVerseId = $html.find(".v").first().attr("id");
      const endVerseId = $html.find(".v").last().attr("id");
      $html.find("header").remove();

      this.contentHtml = $html.html();

      if (startVerseId) {
        this.startVerse = startVerseId.replace(
          /v(\d+)-(\d+)-(\d+)-(\d+)/g,
          "$3"
        );
        this.endVerse = endVerseId.replace(/v(\d+)-(\d+)-(\d+)-(\d+)/g, "$3");
      }
    },

    loadStudyDiscoverFromFullChapterHtml(html, filter = undefined) {
      var $html = $(html);

      // Get study notes info
      var $study = $html.find("#studyDiscover");
      if (filter !== undefined) {
        $study.find(filter).remove();
      }

      // Get metadata info about the chapter
      var $hiddenInputs = $html.find('#article input[type="hidden"]');

      // Append the article and hidden study div to the result wrapper div
      this.hiddenInputsHtml = $hiddenInputs.html();
    },

    enhancePresentation() {
      if (!this.presentationEnhanced) {
        this.getTopics();
        this.removeSpeechSymbols();
        this.addHeadings();
        this.addVerse1();
        this.highlightImportantVerses();
        this.processFootnotes();
        this.presentationEnhanced = true;
      }
    },

    highlightImportantVerses() {
      $(this.chapter.html)
        .find(".summaryOverview .L3, .summaryOutline .L3")
        .each((index, node) => {
          var $verseLink = $(node).find(".outlineItem");
          var href = $verseLink.attr("href");
          if (href) {
            if ($verseLink.text().match(/^\d+$/)) {
              var verseNum = $verseLink.text();
              let selector = `.v[id^=v${this.bookId}-${this.chapterId}-${verseNum}-]`;
              let $importantVerses = $(this.resultElem).find(selector);
              $importantVerses.each((index, span) => {
                $(span).addClass("important-verse");
              });
            }
          }
        });
    },

    async processFootnotes() {
      $(this.resultElem)
        .find(".fn")
        .each((index, anchor) => {
          let footnoteText = this.getFooteNoteText(
            anchor,
            this.chapter.htmlParsed.querySelector("#studyDiscover")
          );
          if (footnoteText) {
            $(anchor).replaceWith(
              ` <span class="in-verse-footnote"><em>[${footnoteText}]</em></span> `
            );
          }
        });
    },

    getFooteNoteText(footnoteLinkElement, studyElem) {
      var footnoteId = $(footnoteLinkElement).attr("data-fnid");
      var $footnote = $(studyElem.innerHTML).find(
        `[data-extract-id="verseFootnote-${footnoteId}"]`
      );
      $footnote.find(".marker").remove();
      let footnoteText = $footnote.find("p").html();
      if (footnoteText !== undefined) {
        return footnoteText;
      }
    },

    removeSpeechSymbols() {
      for (let span of this.resultElem.querySelectorAll(".v")) {
        if (span.childNodes) {
          for (let text of [...span.childNodes].filter(
            (n) => n.nodeType == Node.TEXT_NODE
          )) {
            text.nodeValue = text.nodeValue.replace(/[·ʹ]/g, "");
          }
        }
      }
    },

    addVerse1() {
      $(this.resultElem)
        .find(".cl, .verses .cl")
        .each(function () {
          let verseLink = $('<a class="vl" href="#">1&nbsp;</a>')[0];
          if ($(this).is(".vx")) {
            $(verseLink).addClass("vx");
          }
          $(this).after(verseLink);
        });
    },

    getTopics() {
      var text = "";
      $(this.contentHtml)
        .find(".v")
        .each(function () {
          text = text + $(this).text();
        });
      let properNouns = this.findProperNouns(text);
      this.topics = this.topics.concat(properNouns);
      this.topics = this.topics.concat(this.placeNames);
      return this.topics;
    },

    findProperNouns(text) {
      text = text.replace(/[.+!?’”0-9]\s[A-Z]/g, "");
      let matches = text.match(/ [A-Z][a-z]+/g);
      if (matches !== null) {
        let array = matches.map(function (term) {
          return term.trimLeft();
        });
        return [...new Set(array)];
      }
    },

    /**
     * Add headings (content summary) to the scripture
     * @returns void
     */
    addHeadings() {
      $(this.chapter.html)
        .find(
          ".summaryOutline .L2 > p, .summaryOverview .L1 > p,  .summaryOverview .L2 > p"
        )
        .each((index, node) => {
          var a = $(node).find(".outlineItem")[0];
          var href = $(a).attr("href");
          if (href) {
            var startChapter;
            var startVerse;
            if ($(a).text().indexOf(":") !== -1) {
              startChapter = $(a)
                .text()
                .replace(/(\d+?):(\d+).*/, "$1");
              startVerse = $(a)
                .text()
                .replace(/(\d+?):(\d+).*/, "$2");
              if (startChapter !== this.chapterId) {
                return;
              }
            } else {
              startVerse = $(a)
                .text()
                .replace(/(\d+).*/, "$1");
            }
          } else {
            startVerse = 1;
          }
          var $that = $(node).clone();
          var selector = `[id^="v${this.bookId}-${this.chapterId}-${startVerse}"]`;
          var startVerseParagraph = $(this.resultElem)
            .find(selector)
            .first()
            .parent()[0];
          $(startVerseParagraph).before(
            '<li class="scripture-outline">' + $that.text() + "</li>"
          );
        });
    },

    parseVerseId(verseId) {
      return {
        bookNum: verseId.replace(/v(\d+)-(\d+)-(\d+)-(\d+)/g, "$1"),
        chapterNum: verseId.replace(/v(\d+)-(\d+)-(\d+)-(\d+)/g, "$2"),
        verseNum: verseId.replace(/v(\d+)-(\d+)-(\d+)-(\d+)/g, "$3"),
      };
    },

    getLastVerse() {
      return this.constructor.parseVerseId(
        $(this.selector).find(".v").last().attr("id")
      ).verseNum;
    },

    goToPreviousVerse() {
      this.currentVerse = Math.max(this.currentVerse - 1, this.startVerse);
      this.highlightVerse(this.currentVerse);
      if (this.articleAudio) {
        this.articleAudio.advanceToVerse(this.currentVerse);
      }
      this.scrollVerseIntoView(this.currentVerse);
    },

    goToNextVerse() {
      this.currentVerse = Math.min(this.currentVerse + 1, this.endVerse);
      this.highlightVerse(this.currentVerse);
      if (this.articleAudio) {
        this.articleAudio.advanceToVerse(this.currentVerse);
      }
      this.scrollVerseIntoView(this.currentVerse);
    },

    activateClickVerseNumToLoadReference() {
      // Need to reimplement
    },

    loadFromJson(json) {
      var scripture = json.items[0];
      this.loadFromHtmlSnippet(scripture.content);
    },

    loadFromHtmlSnippet(html) {
      this.loadFromHtml(html);
      this.loadStudyDiscover();
    },

    loadStudyDiscover(
      filter = undefined,
      url = this.url,
      callback = function () {}
    ) {
      // Load study notes, etc from corresponding html page
      var chapter = this;
      Wol.getBibleChapterThen(url, function (html) {
        chapter.loadStudyDiscoverFromFullChapterHtml(html, filter);
        callback();
      });
    },

    hasStudyNotes() {
      let chapter = this;
      if (
        chapter.studyElem &&
        $(chapter.studyElem).find(".studyNote").length > 0
      ) {
        return true;
      }
    },

    verseHasReference(
      verseNum,
      types = ["publication-references, media, study-notes"]
    ) {
      // types: publication-references, media, study-notes
      for (let type of types) {
        if (this.getVerseReferences(verseNum, type)) {
          return true;
        }
      }
      return false;
    },

    getVerseReferences(verseNum, type = "publication-references") {
      let match = false;
      $(this.getLastSpanOfVerse(verseNum))
        .nextUntil("span")
        .each(function () {
          if ($(this).is("." + type)) {
            match = this;
            return true;
          }
        });
      return match;
    },

    async highlightVerse(verseNum) {
      $(this.resultElem)
        .find(`.v:not([id^=v${this.bookId}-${this.chapterId}-${verseNum}])`)
        .removeClass("current-marker");
      let matchedVerseSpans = this.getVerseSpanByNum(verseNum);
      for (let span of matchedVerseSpans) {
        span.classList.add("current-marker");
      }
      var book = langData.books[this.bookId - 1];
      $(".reference-indicator").remove();
      var reference = book.official + "\xa0" + this.chapterId + ":" + verseNum;
      $(this.mediaBar.refStatus).text(reference);
      // $matchedVerse.prepend('<span class="reference-indicator">' + book.official + ' ' + this.chapterId + ':' + verseNum + '</span>')
      // If no current-marker found, we are out of range!  Stop audio
      if (matchedVerseSpans.length === 0) {
        this.player.pause();
      }
      this.currentVerse = Number(verseNum);
    },

    getVerseSpanByNum(verseNum) {
      let $verseSpan = this.resultElem.querySelectorAll(
        `.v[id^=v${this.bookId}-${this.chapterId}-${verseNum}-]`
      );
      return $verseSpan;
    },

    addLineBreaks() {
      $(this.resultElem)
        .find(
          "p, .scripture-processor-result h1, .scripture-processor-result h2"
        )
        .after("<p>&nbsp;</p>");
    },

    removePlusSigns() {
      $(this.element)
        .find(".b")
        .each(function () {
          if ($(this).text() === "+") {
            $(this).remove();
          }
        });
    },

    scrollVerseIntoView(verseNum) {
      // Find the last span of the current verse, and scroll into view
      var spansOfVerse = this.getVerseSpanByNum(verseNum);
      if (spansOfVerse.length > 0) {
        var lastSpanOfVerse = spansOfVerse[spansOfVerse.length - 1];
        if (!Helper.isInView(lastSpanOfVerse)) {
          lastSpanOfVerse.scrollIntoView(false, {
            behavior: "smooth",
            // or "auto" or "instant"
            block: "center", // or "end"
          });
          window.scrollBy(0, 300);
        }
      }
    },

    activateClickVerseToPlay() {
      var chapter = this;
      // When you click on a verse
      $(this.resultElem)
        .find(".v")
        .click(function () {
          var verseNum = chapter.getVerseNumFromId($(this).attr("id"));
          // If you clicked on a verse already highlighted, then toggle playback
          if ($(this).hasClass("current-marker")) {
            // Audio should already be at the beginning or middle of the verse
            // if playhead is at the end of the verse, seek back to the start of the verse
            if (
              Math.abs(
                chapter.player.currentTime -
                  chapter.articleAudio.getVerseStartTime(Number(verseNum) + 1)
              ) < 0.2
            ) {
              chapter.articleAudio.advanceToVerse(verseNum);
            }
            chapter.articleAudio.togglePlayback();
          } else {
            // Otherwise highlight the verse, and seek audio to the verse
            chapter.highlightVerse(verseNum);
            if (chapter.articleAudio !== null) {
              // chapter.player.load()
              chapter.articleAudio.advanceToVerse(verseNum);
            }
          }
        });
    },

    getNextVerseWith(types) {
      let verseNum = this.player.currentVerse;
      while (verseNum <= this.endVerse) {
        if (this.verseHasReference(verseNum, types)) {
          return verseNum;
        }
        verseNum++;
      }
    },

    getVerseNumFromId(verseId) {
      return String(verseId).replace(/^v(.*)-(.*)-.*$/g, "$2");
    },

    removeVerseLinks() {
      $(this.element)
        .find(".vl")
        .each(function () {
          $(this).replaceWith("<strong>" + $(this).text() + "</strong>");
        });
    },

    removeChapterNumber() {
      $(this.element).find(".cl").remove();
    },

    replaceWithLargeImage() {
      $(this.element)
        .find("img[data-img-large-src]")
        .each(function () {
          $(this).attr("src", $(this).attr("data-img-large-src"));
        });
    },
  },
};
</script>

<style>
.load-more-btn {
  width: 100%;
  margin-bottom: 0.5rem;
  font-weight: normal;
  color: #999;
  font-size: 0.8rem !important;
  text-transform: uppercase;
  padding: 0;
  border-radius: 0;
  background: none;
  text-align: right;
  margin-bottom: 1.5rem;
}

.scripture-citation-caption::after {
  content: " ";
}

.scripture-processor-tooltip {
  background: #fff;
  position: fixed;
  width: 300px;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.5);
  top: 9em;
  left: 2em;
  z-index: 9999;
  max-height: calc(100vh - 4em);
  overflow: scroll;
}

.scripture-processor-tooltip-content {
  padding: 1em;
}

.scripture-processor-tooltip p:last-child {
  margin-bottom: 0;
}

.scripture-processor-tooltip-image {
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: none !important;
  height: 3rem;
  width: 3rem;
}

.scripture-processor-tooltip-header {
  height: 3rem;
  background: #e4e4e4;
}

.scripture-processor-tooltip-header a {
  box-shadow: none !important;
}

.scripture-processor-tooltip-caption {
  box-shadow: none;
  position: absolute;
  top: 0.3rem;
  left: 3.5rem;
  padding: 0;
  font-size: 1rem;
  max-width: 12rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.scripture-processor-tooltip-source {
  box-shadow: none;
  position: absolute;
  top: 1.7rem;
  left: 3.5rem;
  padding: 0;
  font-size: 0.7rem;
  font-weight: normal;
  max-width: 12rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.scripture-processor-close-tooltip {
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 0;
  background: #b1b1b1;
  height: 3rem;
  width: 3rem;
  padding: 0;
}

.scripture-processor-close-tooltip span {
  display: none;
}

.scripture-processor-close-tooltip::before {
  content: "X";
  font-size: 1.2rem;
  font-weight: normal;
}

.scripture-processor-result {
  padding-top: 2rem;
  padding-bottom: 2rem;
}


.scripture-processor-result h1 {
  display: none;
}

.scripture-processor-result h2 {
  margin: 2rem 0;
  padding: 0;
}

.scripture-processor-result p {
  text-indent: 1rem;
  margin-bottom: 0;
}

.scripture-processor-result li p {
  text-indent: 0;
  margin-bottom: 0.5rem;
}

.scripture-processor-result li {
  text-indent: 0 !important;
  list-style: none;
}

.scripture-processor-result p + .scripture-outline {
  margin-top: 1em;
}

.scripture-processor-result .scripture-outline + p {
  text-indent: 0;
}

.scripture-processor-result .scripture-outline {
  margin-left: 1rem;
  font-weight: 600;
  color: #748cb1;
  margin-bottom: 1rem;
}

.scripture-processor-result .scripture-outline::before {
  content: "\2752";
  margin-left: -1rem;
  width: 1rem;
  position: absolute;
}

.scripture-processor-result img {
  box-shadow: none !important;
}

.scripture-processor-result a {
  box-shadow: none !important;
  text-decoration: underline;
}

.scripture-processor-result .media .icon {
  display: none;
}

.scripture-processor-result .caption p {
  margin-bottom: 0;
}

.scripture-processor-result > p {
  margin-bottom: 0;
}

.scripture-heading {
  text-indent: 0;
  margin-top: 2em;
  margin-bottom: 2em;
  text-align: center;
}

.hebrew-scriptures,
.greek-scriptures,
.scripture-processor-chapter-list {
  display: grid;
  grid-template-columns: 20% 20% 20% 20% 20%;
  padding-left: 0;
}

.scripture-processor-book-list-item,
.scripture-processor-chapter-list-item {
  list-style: none;
  margin: 0.1rem;
  text-align: center;
}

@media (min-width: 769px) {
  .scripture-processor-book-list-item
    .scripture-processor-book-list-item-abbreviation,
  .scripture-processor-book-list-item
    .scripture-processor-book-list-item-official {
    display: none;
  }
}

@media (min-width: 480px) and (max-width: 768px) {
  .scripture-processor-book-list-item .scripture-processor-book-list-item-name,
  .scripture-processor-book-list-item
    .scripture-processor-book-list-item-official {
    display: none;
  }
}

@media (max-width: 480px) {
  .scripture-processor-book-list-item .scripture-processor-book-list-item-name,
  .scripture-processor-book-list-item
    .scripture-processor-book-list-item-abbreviation {
    display: none;
  }
}

.scripture-processor-book-list-item a,
.scripture-processor-chapter-list-item a {
  box-shadow: none !important;
  background-color: #f1f1f1;
  padding: 0.5rem;
  font-size: 0.8em;
  display: block;
  height: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
}

.scripture-processor-book-list-item a {
  color: inherit;
}

.scripture-processor-book-list-item a[data-category="pentateuch"] {
  background-color: #c2c4e4;
}

.scripture-processor-book-list-item a[data-category="historical"] {
  background-color: #c2d8e4;
}

.scripture-processor-book-list-item a[data-category="poetic"] {
  background-color: #c2e5c9;
}

.scripture-processor-book-list-item a[data-category="prophetic"] {
  background-color: #e5d9c2;
}

.scripture-processor-book-list-item a[data-category="gospels"] {
  background-color: #e5c2c2;
}

.scripture-processor-book-list-item a[data-category="acts"] {
  background-color: #e5dac2;
}

.scripture-processor-book-list-item a[data-category="letters"] {
  background-color: #c2d8e5;
}

.scripture-processor-book-list-item a:hover,
.scripture-processor-chapter-list-item a:hover {
  background-color: #9a999c;
  color: white !important;
}

.scripture-processor-book-list-item a:hover,
.scripture-processor-chapter-list-item a:hover {
  background-color: #9a999c;
  color: white !important;
}

.scripture-processor-process-btn,
.scripture-processor-back-to-books-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.3rem;
}

.scripture-processor-back-to-books-btn {
  margin-bottom: 1rem;
}

.scripture-processor-previous-btn {
  text-align: left;
}

.scripture-processor-controls {
  margin-bottom: 1rem;
}

.scripture-processor-controls-range {
  display: flex;
  overflow: hidden;
}

.scripture-processor-controls-range select {
  margin-right: 0.2rem;
  width: 50%;
}

.scripture-processor-controls-range select#bible {
  width: 100%;
}

.scripture-processor-result .important-verse {
  font-weight: 600;
}

.scripture-processor-result .in-verse-footnote {
  font-weight: normal;
  color: #b28a74;
  font-size: 0.75em;
  /* background-color: #f6f6f6; */
}

.scripture-processor-result .in-verse-footnote em {
  font-style: normal;
  position: relative;
}

.scripture-processor-controls select {
  font-size: 0.85rem;
}

.scripture-processor-result .current-marker {
  background: hsla(217, 89%, 93%, 1);
  box-shadow: 0 0 5px 5px hsla(217, 89%, 93%, 1);
}

.scripture-processor-result .jw-study-aid-citation-item .current-marker {
  background: inherit;
  box-shadow: inherit;
}

.scripture-processor-result .reference-indicator {
  position: absolute;
  background: #f6f6f6;
  right: calc(100% + 1.5rem);
  top: -0.3rem;
  width: 4rem;
  text-align: center;
  font-size: 0.8rem;
  color: #6b6b6b;
  line-height: 2rem;
  height: 2rem;
}

.scripture-processor-result .reference-indicator::before {
  content: " ";
  display: block;
  position: absolute;
  right: -1rem;
  top: 0.5rem;
  border-top: 0.5rem solid;
  border-right: 0.5rem solid;
  border-bottom: 0.5rem solid;
  border-left: 0.5rem solid;
  border-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) #fafafa;
}

.reference-status {
  line-height: 2rem;
  height: 2rem;
  text-align: right;
  padding: 0 0.5rem;
  background: #444444;
  color: white;
  cursor: pointer;
  flex: 1;
  white-space: nowrap;
}

a.leaflet-popup-close-button {
  box-shadow: none;
}

.scripture-processor {
  position: relative;
}

.bible-chapter-timeline {
  max-height: 20rem;
  background-color: white;
  padding: 1rem;
  overflow: scroll;
}

a.leaflet-popup-close-button {
  box-shadow: none !important;
}

.jw-study-aid-place-icon {
  text-align: left;
  font-size: 0.9rem;
  font-weight: bold;
  text-shadow: 0 0 3px white, 0 0 3px white, 0 0 3px white, 0 0 3px white,
    0 0 3px white;
}

.jw-study-aid-place-icon .label-inner {
  margin-left: 50%;
}

.bible-place {
  cursor: pointer;
}

.jw-study-aid-place-icon-region {
  text-align: center;
  font-size: 1.75em;
  font-weight: bold;
  color: white;
  text-transform: uppercase;
  position: relative;
}

.jw-study-aid-place-icon-region .label-inner {
  display: block;
  position: relative;
  bottom: 0.7em;
  left: 0.7em;
}

.bible-chapter-timeline-container .jw-nav-tabs,
.bible-chapter-timeline-container .jw-study-aid-search-controls {
  display: none;
}

.scripture-processor-result h1 {
  text-align: center;
}

.scripture-processor-result .timeline-event {
  list-style: disc !important;
}

.renderings .timeline-event {
  padding-top: 1rem;
  margin: 0;
  border-top: 1px solid #cccccc;
  line-height: 0;
}

.renderings .timeline-event .grid {
  display: grid;
  grid-template-columns: 10% 60% 30%;
  padding: 0;
  margin: 0;
  line-height: 1.5;
}

.renderings .symbol {
  text-align: center;
  font-weight: bold;
}

.renderings .image img {
  width: 100%;
  max-height: 10rem;
  object-fit: cover;
  object-position: top;
}

.scripture-processor-result .b[data-bid],
.scripture-processor-result .cl {
  display: none;
}

.scripture-processor-result .fn {
  text-decoration: none;
}

.scripture-processor-result .jw-study-aid-citation-item .b[data-bid],
.scripture-processor-result .jw-study-aid-citation-item .fn,
.scripture-processor-result .jw-study-aid-citation-item .cl {
  display: inline;
}

.scripture-processor-result .vl {
  box-shadow: none;
  text-decoration: none;
  color: #758cb1;
}

.scripture-processor-result .vx {
  font-weight: bold;
}

.ref-collapse-button {
  background: #d0d0d0;
  width: 1rem;
  height: 1rem;
  padding: 0;
  margin: 0 0.3rem;
  position: sticky;
  position: -webkit-sticky;
  top: 4.3rem;
  float: right;
  margin-right: -1.5rem;
  z-index: 1;
  display: none;
}

.ref-collapse-button i {
  font-size: 0.7rem;
  position: relative;
  bottom: 0.15rem;
}

.collapsed > .ref-collapse-button {
  top: 0;
}

.study-notes,
.media,
.publication-references {
  margin: 1rem 0;
  position: relative;
  margin-right: -1.5rem;
  padding-right: 1.5rem;
}

.study-notes.collapsed,
.media.collapsed,
.publication-references.collapsed {
  height: 2rem;
  overflow: hidden;
}

.study-notes.collapsed::after,
.media.collapsed::after,
.publication-references.collapsed::after {
  content: " ";
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  position: absolute;
  height: 2rem;
  width: calc(100% - 2rem);
  bottom: 0;
  right: 0;
}
</style>