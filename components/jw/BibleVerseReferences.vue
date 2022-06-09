<template>
  <span v-if="vx">
    <span :id="id"><slot></slot></span>
    <button
      class="bg-gray-300 p-1 text-white rounded relative bottom-0.5 mr-1"
      style="font-size: 0.55em"
      @click="expand = !expand"
    >
      <i class="fas fa-ellipsis-h"></i>
    </button>
    <div v-if="expand && references.length > 0" class="article-snippets mt-3 mb-3">
      <ArticleSnippet
        v-for="(reference, index) of footnoteReferences"
        :key="`bible-verse-snippet-${id}-${index}`"
        :article="reference"
        ref="articleSnippet"
      />
      <ArticleSnippet
        v-for="(reference, index) of visibleReferences.slice(0, maxSnippets)"
        :key="`bible-verse-footnote-snippet-${id}-${index}`"
        :jsonUrl="reference.url ? htmlUrlToJsonUrl(reference.url) : undefined"
        ref="articleSnippet"
      />
      <ArticleSnippet
        v-for="(reference, index) of studyReferences"
        :key="`bible-verse-study-snippet-${id}-${index}`"
        :article="reference"
        ref="articleSnippet"
      />
      <button
        class="load-more-btn btn-plain"
        :id="`load-more-verse-${verseNum}`"
        :data-verse-num="verseNum"
        v-if="visibleReferences.length > maxSnippets"
        @click="maxSnippets += 3"
      >
        Load more
      </button>
    </div>
  </span>
</template>

<script>
import Wol from "@/lib/jw/Wol";
import Manuscripts from "@/lib/jw/Manuscripts";
import langData from "@/lib/jw/languages/en-US";
import $ from "jquery";

export default {
  props: ["id", "vx", "studyElem"],
  data() {
    return {
      expand: false,
      referencesLoaded: false,
      references: [],
      footnoteReferences: [],
      studyReferences: [],
      maxSnippets: 3,
    };
  },
  computed: {
    collapsed() {
      return this.$refs.articleSnippet
        ? this.$refs.articleSnippet.collapsed
        : undefined;
    },
    bookId() {
      return this.parseVerseId(this.id).bookNum;
    },
    chapterId() {
      return this.parseVerseId(this.id).chapterNum;
    },
    verseNum() {
      return this.parseVerseId(this.id).verseNum;
    },
    verseId() {
      let verse = this.parseVerseId(this.id)
      return `${verse.bookNum}-${verse.chapterNum}-${verse.verseNum}`
    },
    visibleReferences() {
      return this.references.filter((ref) => ref.url || ref.html);
    },
    hasStudyNotes() {
      if (this.studyElem && $(this.studyElem).find(".studyNote").length > 0) {
        return true;
      }
    },
  },
  watch: {
    expand() {
      if (this.expand && !this.referencesLoaded) {
        this.loadReferences(this.verseNum);
      }
    },
  },
  methods: {
    htmlUrlToJsonUrl(htmlUrl) {
      return Wol.htmlUrlToJsonUrl(htmlUrl);
    },
    maximize() {
      if (this.$refs.articleSnippet)
        this.$refs.articleSnippet.collapsed = false;
    },
    minimize() {
      if (this.$refs.articleSnippet) this.$refs.articleSnippet.collapsed = true;
    },

    async loadReferences() {
      // Don't load all references more than once
      if (!this.referencesLoaded) {
        this.references = await this.processPublicationIndex();
        this.footnoteReferences = this.getReferenceBibleFootnotes(
          this.verseNum
        );
        this.studyReferences = await this.getStudyNotesSnippets(this.verseId);
        
        // this.mediaSnippets = await this.getMediaSnippets(this.id);
        // this.getSongs(verseNum);
        // this.getVideos(verseNum);
        // this.replaceWithLargeImage()
        this.referencesLoaded = true;
      }
    },

    getStudyNotesSnippets(verseId) {
      let chapter = this;
      var studyNotes = $(chapter.studyElem.innerHTML)
        .find(`.section[data-key="${verseId}"] .studyNote`)
        .get(0);
      
      let studySnippets = [];
      if ($(studyNotes).find("p").length > 0) {
        $(studyNotes)
          .find("p")
          .each(function () {
            var studySnippet = {
              lang: "en",
              content: this.innerHTML,
              thumbnail: Wol.baseUrl + langData.bible_thumb_url,
              keywords: [],
            };
            var strongElems = $(this)
              .find("strong")
              .get()
              .sort(function (a, b) {
                // ASC  -> a.length - b.length
                // DESC -> b.length - a.length
                return b.length - a.length;
              });
            $.each(strongElems, function () {
              var strongtext = $(this).text();
              strongtext = strongtext.replace(/(.*)[:.,]\s?$/, "$1");
              studySnippet.keywords.push(strongtext);
            });
            studySnippets.push(studySnippet);
          });
      }
      return studySnippets;
    },

    async processPublicationIndex() {
      var verseId = String(this.id).replace(/^v(.*)-1$/g, "$1");
      if (this.studyElem) {
        let references = this.studyElem
          .querySelectorAll(
            `.section[data-key="${verseId}"] .index a, .section[data-key="${verseId}"] .index .ni`
          )
          .map((node) => {
            let url = node.getAttribute("href");
            if (url) {
              return {
                type: "ref",
                title: node.innerText.trim(),
                url: "https://wol.jw.org" + url,
              };
            } else {
              return {
                type: "ni",
                title: node.innerText.trim(),
              };
            }
          });
        return references;
      } else {
        // let article = await Wol.getArticle(this.vx, "div.results");
        // ...
      }
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

    parseVerseId(verseId) {
      return {
        bookNum: verseId.replace(/v(\d+)-(\d+)-(\d+)-(\d+)/g, "$1"),
        chapterNum: verseId.replace(/v(\d+)-(\d+)-(\d+)-(\d+)/g, "$2"),
        verseNum: verseId.replace(/v(\d+)-(\d+)-(\d+)-(\d+)/g, "$3"),
      };
    },

    async getReferenceBibleFootnotes(verseNum) {
      var chapter = this;
      let enLangData = require("@/lib/jw/languages/en-US").default;

      // Assuming locale is en-US
      for (let bible of enLangData.bibles) {
        if (bible.slug === "Rbi8") {
          let refBibleUrl =
            Wol.baseUrl + bible.url + this.bookId + "/" + this.chapterId;
          // Get the ref Bible page
          let response = await Wol.getArticle(refBibleUrl);

          // Construct a list of footnotes
          let footnotes = [];
          let article = response.content;
          let studyElm = response.studyParsed;
          $(article)
            .find("a.fn")
            .each(function () {
              let footNoteHtml = chapter.getFooteNoteText(this, studyElm);
              let footNoteVerseNum = chapter.parseVerseId(
                $(this).parent().attr("id")
              ).verseNum;
              if (verseNum !== undefined && verseNum !== footNoteVerseNum) {
                return true; // skip to next iteration
              }
              let preceedingText;
              if (this.previousSibling.nodeValue) {
                preceedingText = this.previousSibling.nodeValue
                  .trim()
                  .replace(/(\.|,|:|;)$/, "");
              }
              footnotes.push({
                verseNum: footNoteVerseNum,
                html: footNoteHtml,
                preceedingText: preceedingText,
              });
            });
          for (let footnote of footnotes) {
            if (Manuscripts.isRef(footnote.html)) {
              footnote.renderings = Manuscripts.parseManuscriptReferenceString(
                footnote.html
              );
            }
          }
          let symbolTable = await Manuscripts.loadSymbolTable();

          for (let footnote of footnotes) {
            if (footnote.renderings) {
              for (let rendering of footnote.renderings) {
                rendering.refs = Manuscripts.lookupSymbolTable(
                  rendering.refString,
                  symbolTable
                );
              }
            }
          }
          let footnoteReferences = footnotes.map((footnote) => {
            let lastWords = "";
            if (footnote.preceedingText) {
              let words = footnote.preceedingText.split(" ");
              lastWords =
                "... " + words.slice(words.length - 4, words.length).join(" ");
            }
            return {
              lang: "en",
              thumbColor: "#4e1d20",
              content: footnote.html,
              caption: lastWords,
              title: "Reference Bible",
            };
          });
          // Attach them as snippets
          return footnoteReferences;
        }
      }
    },

    getMediaSnippets(verseId) {
      let chapter = this;
      var media = $(chapter.studyElem)
        .find(`.section[data-key="${verseId}"] .media .content`)
        .get(0);
      let mediaSnippets = [];

      $(media)
        .find("li")
        .each(function () {
          var mediaSnippet = new ArticleSnippet({
            parent: chapter,
            lang: "en",
          });
          mediaSnippet.load_html(this.innerHTML);
          mediaSnippet.set_thumbnail(
            Config.wolBaseUrl + chapter.langData.bible_thumb_url
          );
          mediaSnippet.activateSwipeToRemove();
          chapter.enhanceMediaSnippet(mediaSnippet);
          mediaSnippets.push(mediaSnippet);
          chapter.mediaSnippets.push(mediaSnippet);
        });
      return mediaSnippets;
    },

    getMediaSnippetsInWrapper(verseId) {
      let chapter = this;
      var mediaWrapper = $('<ul class="media">')[0];
      let mediaSnippets = chapter.getMediaSnippets(verseId);
      for (let mediaSnippet of mediaSnippets) {
        $(mediaWrapper).append(mediaSnippet.element);
      }
      return mediaWrapper;
    },

    getStudyNotesSnippetsInWrapper(verseId) {
      let chapter = this;
      var studyNotesWrapper = $('<ul class="study-notes">')[0];
      let studySnippets = chapter.getStudyNotesSnippets(verseId);
      for (let studySnippet of studySnippets) {
        $(studyNotesWrapper).append(studySnippet.element);
      }
      return studyNotesWrapper;
    },

    enhanceMediaSnippets() {
      for (let mediaSnippet of this.mediaSnippets) {
        this.enhanceMediaSnippet(mediaSnippet);
      }
    },

    getSongs(verseNum = undefined) {
      let chapter = this;
      let verseNums = [];
      if (verseNum !== undefined) {
        verseNums.push(verseNum);
      } else {
        $(chapter.resultElem)
          .find(".vl")
          .each(function () {
            let verseId = $(this).parent().attr("id");
            let ref = chapter.parseVerseId(verseId);
            verseNums.push(ref.verseNum);
          });
      }
      Wol.getArticleHtmlThen(
        Wol.base_url + langData.songIndex,
        function (html) {
          let article = $(html).find("article")[0];
          let ps = $(article).find("> *").get();
          let root = Helper.nestByHeadings(ps, ".se", ".sb", "a");
          // We want a table like:
          // [ book: 39, chapter: 1, verse: 2, song: 6 ]
          let scriptureToSong = [];
          let lastRow = {};
          for (let se of root.items) {
            if (se.selector === ".se") {
              lastRow.book = se.text;
              for (let sb of se.items) {
                let $sb = $("<div />");
                $sb.html(sb.html);
                let $ref = $sb.find(".b");
                let $songs = $sb.find("a:not(.b)");
                let matches = $ref.text().match(/(\d+)(:|：)(\d+)/);
                if (matches) {
                  lastRow.chapter = matches[1];
                  lastRow.verse = matches[3];
                  $songs.each(function (index, song) {
                    let songNum = $(song).text();
                    lastRow.song = songNum;
                    lastRow.url = $(song).attr("href");
                    scriptureToSong.push(Object.assign({}, lastRow));
                  });
                }
              }
            }
          }
          for (let verseNum of verseNums) {
            for (let scripture of scriptureToSong) {
              if (
                scripture.book === chapter.book.name &&
                scripture.chapter === chapter.chapterId &&
                scripture.verse === verseNum
              ) {
                let songUrl = scripture.url;
                let songSnippet = new ArticleSnippet({
                  parent: chapter,
                  backgroundAudio: true,
                });
                chapter.wol.getArticleJsonThen(
                  chapter.wol.htmlUrlToJsonUrl(songUrl),
                  function (json) {
                    songSnippet.load_json(json);
                    songSnippet.add_reference_link(
                      json.items[0].preReference,
                      songUrl
                    );
                    songSnippet.add_audio_player(chapter.langData.jwLangSymbol);
                    chapter.attachToVerse(songSnippet.element, verseNum);
                  }
                );
              }
            }
          }
        }
      );
    },

    addCollapseButtonIfNeeded(articleSnippetsWrapper) {
      // If there is no collapse button
      let collapseButton = $(articleSnippetsWrapper).find(
        ".ref-collapse-button"
      )[0];
      if (!collapseButton) {
        // Add the button
        collapseButton = $(
          `<button class="ref-collapse-button"><i class="octicon octicon-dash"></i></button>`
        )[0];
        $(collapseButton).on("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          let $icon = $(this).find(".octicon");
          $icon.toggleClass("octicon-dash");
          $icon.toggleClass("octicon-plus");
          $(this).parent().toggleClass("collapsed");
          if (!Helper.isInView(collapseButton)) {
            collapseButton.scrollIntoView(false, {
              behavior: "smooth",
              block: "center",
            });
            window.scrollBy(0, 300);
          }
        });
        $(articleSnippetsWrapper).prepend(collapseButton);
      }
    },

    getVideos(verseNum = undefined) {
      let chapter = this;
      let url =
        Config.videoScriptureSearchBase +
        $.param({
          book: this.book.name === "Psalms" ? "Psalm" : this.book.name,
          chapter: this.chapterId,
        });
      $.getJSON({
        url: url,
        success: function (data) {
          chapter.loadVideos(data, verseNum);
        },
      });
    },

    enhanceMediaSnippet(mediaSnippet) {
      var chapter = this;
      // Get media content from links

      $(mediaSnippet.element)
        .find("a.galleryItem")
        .each(function (index, mediaLink) {
          var url =
            $(mediaLink)
              .attr("href")
              .replace(/(.*)#.*/g, "$1") + "?snip=yes";
          chapter.wol.getArticleHtmlThen(url, function (html) {
            var $galleryContent = $(html).find(".gallerySelectedItem");
            $galleryContent.find(".mediaTitle.wide").remove();
            mediaSnippet.set_content($galleryContent.html());
          });
        });
    },

    loadVideos(data, verseNum = undefined) {
      let chapter = this;

      // go through the data
      for (let item of data) {
        if (chapter.seenVids.indexOf(item.vid) === -1) {
          if (verseNum !== undefined && item.verse !== verseNum) {
            continue;
          }
          chapter.seenVids.push(item.vid);
          // for each verse, create a snippet and attach
          let videoSnippet = Video.getVideoSnippet(
            item.vid,
            Number(item.start),
            undefined,
            chapter
          );
          chapter.attachToVerse(videoSnippet.element, item.verse);
        }
      }
    },

    addPublicationSnippets(
      parent,
      verseNum,
      $references,
      taskMaster = undefined
    ) {
      var chapter = parent;
      let snippets = this.getPublicationSnippets(
        parent,
        verseNum,
        $references,
        taskMaster
      );
      if (parent instanceof this) {
        if (snippets.length > 0) {
          let i = 0;
          for (let snippet of snippets) {
            chapter.attachToVerse(snippet.element, verseNum);
          }
        }
      }
    },

    getPublicationSnippetsInWrapper(
      parent,
      verseNum,
      $references,
      taskMaster = undefined
    ) {
      let chapter = this;
      var pubsWrapper = $('<ul class="publication-references">')[0];
      let pubSnippets = chapter.getPublicationSnippets(
        parent,
        verseNum,
        $references,
        taskMaster
      );
      for (let pubSnippet of pubSnippets) {
        $(pubsWrapper).append(pubSnippet.element);
      }
      return pubsWrapper;
    },

    getPublicationSnippets(
      parent,
      verseNum,
      $references,
      taskMaster = undefined
    ) {
      var chapter = parent;
      var that = this;
      var lastSeenParsedRef;
      var snippets = [];

      $references.each(function (key, val) {
        if ($(this).is("a")) {
          var articleUrl = $(this).attr("href");
          if (
            chapter.seenPublicationUrls &&
            chapter.seenPublicationUrls.indexOf(articleUrl) === -1
          ) {
            chapter.seenPublicationUrls.push(articleUrl);

            var articleSnippet = new ArticleSnippet({
              parent: chapter,
            });
            if (taskMaster !== undefined) {
              taskMaster.addTask();
            }
            articleSnippet.loadFromJsonUrl(
              chapter.wol.htmlUrlToJsonUrl(articleUrl),
              function (json) {
                if (taskMaster !== undefined) {
                  taskMaster.removeTask();
                }
                // Look for insight articles (for keyword collection)
                if (
                  json.items[0].englishSymbol &&
                  json.items[0].englishSymbol.indexOf("it") === 0 &&
                  chapter.topics
                ) {
                  chapter.topics = chapter.topics.concat(
                    json.items[0].caption.split(", ")
                  );
                }
              }
            );
            articleSnippet.short_reference = $(this).text();
            articleSnippet.activateSwipeToRemove();
            snippets.push(articleSnippet);
          }
        } else if ($(this).is(".ni")) {
          let pubref = $(this)
            .text()
            .replace(/(,|;)$/, "");
          let parsedRef = that.parsePubRef(pubref, lastSeenParsedRef);
          if (parsedRef !== undefined) {
            lastSeenParsedRef = parsedRef;
            that.createNiArticleSnipppet(
              parsedRef,
              function (niArticleSnippet) {
                niArticleSnippet.activateSwipeToRemove();
                snippets.push(niArticleSnippet);
              }
            );
          }
        }
      });
      return snippets;
    },

    createNiArticleSnipppet(parsedRef, callback) {
      var niArticleSnippet = new ArticleSnippet({
        englishSymbol: parsedRef.symbol,
        pageNums: parsedRef.pages,
      });
      niArticleSnippet.pubScansExist(function () {
        let loaded = niArticleSnippet.loadScans();
        if (loaded) {
          let issue = parsedRef.issue || "";
          niArticleSnippet.add_reference_link(
            `${parsedRef.symbol} ${issue} ${parsedRef.pageRange}`
          );
          callback(niArticleSnippet);
        }
      });
    },

    /**
     * Parases references to jw publications. dp 165 -> Daniel's prophecy page 165
     */
    parsePubRef(pubref, lastSeenRef = undefined) {
      pubref = pubref.trim();
      let matches = pubref.match(/([a-z]+?)(\d*) ((.*) )?(.*)/);
      if (matches) {
        let ref = {
          symbol: matches[1] + matches[2],
          issue: matches[4],
          pageRange: matches[5],
          pages: Helper.rangeToArray(matches[5]),
        };
        return ref;
      } else {
        let matches = pubref.match(/^\d+/);
        if (matches && lastSeenRef !== undefined) {
          let ref = {
            symbol: lastSeenRef.symbol,
            issue: lastSeenRef.issue,
            pageRange: matches[0],
            pages: Helper.rangeToArray(matches[0]),
          };
          return ref;
        }
      }
    },
  },
};
</script>

<style>
</style>