<template>
  <div class="article-processor-result">
    <div class="jw-study-aid-article" ref="jw-study-aid-article" v-if="article">
      <MediaBar ref="mediaBar" :article="article" type="article" />
      <div
        class="article-processor-result-content wol-article"
        ref="article-processor-result-content"
      >
        <v-runtime-template
          ref="template"
          :template="`<article class='jwac'>${article.content
            .replace(/<a /gi, '<JWAnchor ')
            .replace(/<\/a>/gi, '</JWAnchor>')}</article>`"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Wol from "@/lib/Wol.js";
import langData from "@/lib/languages/en-US";
import VRuntimeTemplate from "v-runtime-template";
import $ from "jquery";

export default {
  data() {
    return {
      initialized: false,
      current_paragraph: 0,
      article: undefined,
      mediaBar: undefined,
      pointForm: false,
      seenPublicationUrls: [],
      scriptureSnippets: [],
      scriptureLoaded: false,
      processFootnotesToggle: false,
      loadAudioToggle: true,
      seenScanUrls: [],
    };
  },
  components: {
    VRuntimeTemplate,
  },
  props: {
    url: {
      type: String,
    },
    selector: {
      type: String,
      default: "#article",
    },
    snippet: {
      type: Boolean,
      default: true,
    },
    getClosestHeading: {
      type: Boolean,
      default: false,
    },
    getExtraImages: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    html() {
      return this.article ? this.article.html : undefined;
    },
    prevUrl() {
      return this.article ? this.article.prevUrl : undefined;
    },
    nextUrl() {
      return this.article ? this.article.nextUrl : undefined;
    },
    contentsUrl() {
      return this.article ? this.article.contentsUrl : undefined;
    },
    title() {
      return this.article ? this.article.title : undefined;
    },
    publicationTitle() {
      return this.article ? this.article.publicationTitle : undefined;
    },
  },
  async mounted() {
    if (!this.article) {
      this.article = await Wol.getArticle(
        this.url,
        this.selector,
        this.snippet
      );
    }
    this.element = this.$refs["jw-study-aid-article"];
    this.content = this.$refs["article-processor-result-content"];
    this.mediaBar = this.$refs["mediaBar"];
    this.load();
  },
  async updated() {
    if (this.$refs.mediaBar && this.$refs.template && !this.initialized) {
      this.$refs.mediaBar.article = this;
      if (this.loadAudioToggle) this.$refs.mediaBar.loadArticleAudio();
      this.activateClickParagraphToPlay();
      this.initialized = true;
    }
  },
  methods: {
    /**
     * load()
     *  - loads from this.url
     *    - remove useless stuff
     *    - append article.ajaxSelector (#article)
     *    - process
     *  - or loads this.jsonUrl
     *    - set metadata
     *    - append item.content
     *    - process
     */

    async load() {
      if (this.url !== undefined) {
        this.article = await this.loadHtml();
        this.process();
      }
    },

    async loadHtml() {
      let article = await Wol.getArticle(this.url, this.selector, this.snippet);
      return article;
    },

    getPageNumsFromHtml(html) {
      var pageNums = [];
      var $html = $("<div />").html(html);
      $html.find(".pageNum").each(function () {
        var pageNum = Number($(this).attr("data-no"));
        pageNums.push(pageNum);
      });
      if (pageNums.length > 0) {
        return pageNums;
      }
    },

    activateClickParagraphToPlay() {
      var article = this;
      // When you click on a paragraph
      $(this.content)
        .find("[data-pid]")
        .click(function () {
          var paragraphNum = $(this).attr("data-pid");
          // If you clicked on a paragraph already highlighted, then toggle playback
          if ($(this).hasClass("current-marker")) {
            // article.articleAudio.togglePlayback()
          } else {
            // Otherwise highlight the paragraph
            article.highlightParagraph(paragraphNum);
            article.articleAudio.advanceToParagraph(paragraphNum);
          }
        });
    },

    getHtmlThen(callback) {
      var article = this;
      Wol.getArticleHtmlThen(
        Wol.jsonUrlToHtmlUrl(this.jsonUrl),
        function (html) {
          article.html = html;
          callback(html);
        }
      );
    },

    getExtraImagesAndPutOnTop() {
      var article = this;
      if (article.html !== undefined) {
        var $figures = $(article.html).find("figure");
        if ($figures.length > 0) {
          $figures.each(function (index, figure) {
            var $altText = $('<div class="alt-text"></div>');
            $altText.text($(figure).find("img").attr("alt"));
            $(figure).find("img").after($altText);
            $(article.content).prepend(figure);
          });
        }
      }
    },

    getClosestHeadingAndPutOnTop() {
      var article = this;
      if (article.html !== undefined) {
        var firstParagraphId = $(article.content).find("p").first().attr("id");
        var $closestHeading = $(article.html)
          .find("#" + firstParagraphId)
          .parents(".section")
          .find("h2, h3");
        $(article.content).prepend("<h3>" + $closestHeading.text() + "</h3>");
      }
    },

    highlightParagraph(paragraph_id) {
      $(':not([data-pid="' + paragraph_id + '"])').removeClass(
        "current-marker"
      );
      var $paragraph = $('[data-pid="' + paragraph_id + '"]').addClass(
        "current-marker"
      );
      $(".publication-references .current-marker").removeClass(
        "current-marker"
      );
      return $paragraph[0];
    },

    process() {
      if (this.html !== undefined) {
        if (this.getExtraImages) {
          // Add an image on top of the snippet if there is none
          if ($(this.content).find("img").length === 0) {
            this.getExtraImagesAndPutOnTop();
          }
        }
        if (this.getClosestHeading) {
          this.getClosestHeadingAndPutOnTop();
        }
        this.$emit("articleLoaded");
      }
    },

    paragraphToPointForm() {
      var article = this;
      $(article.content)
        .find("p")
        .each(function () {
          // For each paragraph, split the paragraph into bullet point by seperators
          var html = $(this).html();
          // positive lookbehind isn't supported in Safari
          html = html.replace(
            new RegExp(
              "(" +
                langData.period +
                "|" +
                langData.question_mark +
                "|" +
                langData.exclamation_point +
                ")",
              "g"
            ),
            "$1DELIMITER!!!"
          );
          var array = html.split("DELIMITER!!!");
          // array = [].concat.apply([], array)
          for (var i = 1; i < array.length; i++) {
            if (array[i].indexOf(langData.close_quote) === 0) {
              array[i - 1] = array[i - 1] + langData.close_quote;
              array[i] = array[i].replace(langData.close_quote, "");
            }
            var matches = array[i].match(
              new RegExp(
                "^" +
                  langData.open_parenthesis +
                  ".*?" +
                  langData.close_parenthesis
              )
            );
            if (matches) {
              array[i - 1] = array[i - 1] + matches[0];
              array[i] = array[i].replace(matches[0], "");
            }
            matches = array[i].match(
              new RegExp(
                "^(" +
                  "\\d" +
                  "|" +
                  langData.close_parenthesis +
                  "|" +
                  langData.hyphen +
                  "|" +
                  "\\.|\\s|,|</a>" +
                  "|" +
                  langData.colon +
                  ")+"
              )
            );
            if (matches) {
              array[i] = array[i].replace(matches[0], "");
            }
          }
          if (array.length > 1) {
            var $span = $(
              '<span class="first-sentence">' + array[0] + "</span>"
            );
            var $ul = $('<ul class="point-form" />');
            for (var i = 1; i < array.length; i++) {
              if (array[i] !== "") {
                var $li = $("<li />");
                $li.html(array[i]);
                $ul.append($li);
              }
            }
            $(this).html("");
            $(this).append($span[0]);
            $(this).append($ul[0]);
          }
        });
    },

    getDocId() {
      var article = this;
      var docId;
      if (this.html !== undefined) {
        var articleElem = $(this.html).find("#article")[0];
        if (articleElem !== undefined) {
          $.each(articleElem.classList, function () {
            if (this.match(/docId-(\d+)/g, "$1")) {
              docId = this.replace(/docId-(\d+)/g, "$1");
            }
          });
        }
      }
      return docId;
    },

    getJwLangSymbol() {
      var article = this;
      if (this.html !== undefined) {
        return $(this.html).find("#article").attr("data-lang");
      }
    },

    getAudioPubSymbol() {
      var article = this;
      if (this.html !== undefined) {
        return $(this.html).find("#audioPubSym").val();
      }
    },

    togglePointForm() {
      $(this.content).toggleClass("article-point-form");
    },

    async createScriptureSnippet(href, parent) {
      let article = this;
      let wol = new Wol();
      var jsonUrl = wol.htmlUrlToJsonUrl(href);
      // Load the scripture
      json = await wol.getArticleJson(jsonUrl);
      if (json.items[0].content !== "") {
        article.constructScriptureSnippet(
          href,
          json,
          parent,
          callback,
          taskMaster
        );
      } else {
        // In the rare case where the json doesn't return any content
        let article = await wol.getArticle(href, function (html) {});
        let $html = $(article.html);
        let bookNum = json.items[0].book;
        let chapterNum = json.items[0].first_chapter;
        let startVerseNum = json.items[0].first_verse;
        let endVerseNum = json.items[0].last_verse;
        let content = "";
        for (
          let verseNum = startVerseNum;
          verseNum <= endVerseNum;
          verseNum++
        ) {
          let verseSelector = `[id^="v${bookNum}-${chapterNum}-${verseNum}"]`;
          content = content + $html.find(verseSelector).html();
        }
        json.items[0].content = content;
        article.constructScriptureSnippet(
          href,
          json,
          parent,
          callback,
          taskMaster
        );
      }
    },

    constructScriptureSnippet(href, json, parent, callback) {
      let scriptureSnippet = new ArticleSnippet({
        parent: parent,
        type: "scripture",
        processFootnotesToggle: parent.processFootnotesToggle,
        url: href,
      });
      // Loop through returned items
      var data = json.items[0];
      var verseIds = [];
      for (
        let i = Number(data.first_chapter);
        i <= Number(data.last_chapter);
        i++
      ) {
        for (
          let j = Number(data.first_verse);
          j <= Number(data.last_verse);
          j++
        ) {
          verseIds.push(data.book + "-" + i + "-" + j);
        }
      }
      scriptureSnippet.verseIds = verseIds;
      scriptureSnippet.load_json(json);
      if (parent.processFootnotesToggle) {
        scriptureSnippet.processFootnotes();
      }
      callback(scriptureSnippet);
    },

    removeParenthesisBeforeAndAfterScripture(scripture_link) {
      var please_read = false;
      if (scripture_link.previousSibling) {
        if (scripture_link.previousSibling.nodeValue) {
          // Remove brackets and double dash just before
          var text_before = scripture_link.previousSibling.nodeValue;
          text_before = text_before.replace(
            new RegExp(langData.open_parenthesis + "$"),
            ""
          );
          text_before = text_before.replace(
            new RegExp(langData.long_dash + "$"),
            ""
          );
          scripture_link.previousSibling.nodeValue = text_before;
        } else {
          // Remove 请读 or Please Read text
          var please_read_regexp = new RegExp(
            langData.semicolon +
              "?\\s?" +
              langData.open_parenthesis +
              "?" +
              langData.please_read +
              "?$"
          );
          if (
            scripture_link.previousSibling.childNodes[0] &&
            scripture_link.previousSibling.childNodes[0].nodeValue &&
            scripture_link.previousSibling.childNodes[0].nodeValue.match(
              please_read_regexp
            )
          ) {
            var new_text =
              scripture_link.previousSibling.childNodes[0].nodeValue;
            new_text = new_text.replace(please_read_regexp, "");
            scripture_link.previousSibling.childNodes[0].nodeValue = new_text;
            please_read = true;
          }
        }
      }
      if (scripture_link.nextSibling) {
        // Remove bracket or period after
        var regexp_close_parenthesis_and_or_period = new RegExp(
          "^[" +
            langData.close_parenthesis +
            langData.period +
            langData.semicolon +
            "]+"
        );
        if (scripture_link.nextSibling.nodeValue) {
          scripture_link.nextSibling.nodeValue =
            scripture_link.nextSibling.nodeValue.replace(
              regexp_close_parenthesis_and_or_period,
              ""
            );
        } else {
          // scripture_link.nextSibling.childNodes[0] sometimes is not defined
          if (scripture_link.nextSibling.childNodes[0]) {
            if (scripture_link.nextSibling.childNodes[0].nodeValue) {
              scripture_link.nextSibling.childNodes[0].nodeValue =
                scripture_link.nextSibling.childNodes[0].nodeValue.replace(
                  regexp_close_parenthesis_and_or_period,
                  ""
                );
            }
          }
        }
      }
    },
    hideRandomLines() {
      let article = this;
      $(article.content).find(".alternatePresentation").hide();
      let $ps = $(article.content).find(
        ":not(.jw-study-aid-citation-item) .bodyTxt p[data-pid]:not(.question)"
      );
      let numObscures = Math.floor(
        $(article.content).find(
          ":not(.jw-study-aid-citation-item) .bodyTxt p[data-pid]"
        ).length / 4
      );
      for (let i = 0; i < numObscures; i++) {
        let random = Math.floor(Math.random() * $ps.length);
        $ps.eq(random).each(function () {
          let matches = $(this)
            .text()
            .match(/\(CHORUS(\s\d+)?\)/);
          if (matches === null && $(this).is(":not(.question)")) {
            $(this)
              .addClass("obscure")
              .addClass("question")
              .click(function () {
                $(this).toggleClass("obscure");
              });
          }
        });
      }
    },
  },
};
</script>

<style>
.scripture-processor-result strong,
.article-processor-result-content strong,
.scripture-processor-result h1,
.article-processor-result-content h1,
.scripture-processor-result h2,
.article-processor-result-content h2,
.scripture-processor-result h3,
.article-processor-result-content h3,
.scripture-processor-result h4,
.article-processor-result-content h4,
.scripture-processor-result h5,
.article-processor-result-content h5,
.scripture-processor-result h6,
.article-processor-result-content h6 {
  font-weight: 900 !important;
}

.scripture-processor-result a,
.article-processor-result-content a {
  text-decoration: none;
  color: #758cb1;
  box-shadow: none !important;
}

.article-processor-result .qu {
  font-size: 0.9em;
  color: #e66;
  overflow: hidden;
}

.jw-study-aid-citation-item.please-read {
  background-color: #f1f6fe;
}

.jw-study-aid-citation-item.please-read::before {
  border-color: rgba(0, 0, 0, 0) #e2edfd rgba(0, 0, 0, 0) rgba(0, 0, 0, 0);
}

.article-processor-result-content .point-form {
  padding-left: 2rem;
}

.article-processor-result-content .point-form > li {
  list-style: disc !important;
}

.article-processor-result-content:not(.article-point-form) .point-form,
.article-processor-result-content:not(.article-point-form) .point-form > li {
  display: inline;
  margin: 0;
  padding: 0;
  list-style: none;
}

.jw-study-aid-article li {
  list-style: none;
  position: relative;
  /* padding-left: 2.5rem; */
  /* margin-left: -1rem; */
}

.jw-study-aid-article li > p,
.jw-study-aid-article .chorus > p {
  margin-bottom: 0;
  display: list-item;
  padding-left: 2rem;
}

.jw-study-aid-article li > p::before {
  content: "◼︎";
  position: absolute;
  display: block;
  left: 0.75rem;
  top: 0;
  color: #999;
}

.jw-study-aid-article li > p.current-marker {
  padding-left: calc(2.75rem + 2px);
}

.jw-study-aid-article .directory .card a {
  display: grid;
  grid-template-columns: 4rem 100% 0;
  box-shadow: none;
  grid-column-gap: 1rem;
  border-bottom: 1px solid #ccc;
  align-items: center;
}

.jw-study-aid-article .directory .card a img {
  box-shadow: none;
}

.jw-study-aid-article .directory .card a .details {
  position: absolute;
  right: 0;
}

.article-processor-result .in-verse-footnote {
  font-weight: normal;
  color: #b7b7b7;
  font-style: normal !important;
}

.article-processor-result .current-marker {
  border-left: 2px solid #b5d1ff;
  padding-left: calc(1rem - 2px);
  margin-left: calc(-1rem);
}

.article-processor-result-audio {
  margin-bottom: 2rem;
}

.article-processor-back-to-navigation {
  padding: 0.5rem 1.5rem;
  margin-bottom: 1rem;
}

.article-processor-results-panel .quiz-title {
  text-align: center;
}

.article-processor-controls-wrapper {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eeeeee;
}

.article-processor-result-content .directory.grid {
  display: grid;
  grid-template-columns: 20% 20% 20% 20% 20%;
  grid-gap: 0.2rem;
}

.article-processor-result-content .directory.grid .gridItem a {
  background: #e8eefd;
  text-align: center;
  line-height: 3rem;
  box-shadow: none;
  width: 100%;
  display: block;
}

.article-processor-result-content .directory.grid .gridItem a:hover {
  background: #d4dff5;
}

.article-processor-result-content .backNav .icon {
  display: none;
}

.article-link .thumbnail.publication,
.article-link .thumbnail.container,
.article-link .thumbnail.document {
  display: block;
  height: 4rem;
  background-size: 100%;
}

.article-link .thumbnail.publication {
  background-image: url(https://wol.jw.org/img/publication.png);
}

.article-link .thumbnail.container {
  background-image: url(https://wol.jw.org/img/container.png);
}

.article-link .thumbnail.document {
  background-image: url(https://wol.jw.org/img/document.png);
}
</style>