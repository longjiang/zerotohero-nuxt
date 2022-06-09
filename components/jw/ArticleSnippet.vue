<template>
  <div class="article-snippet">
    <div v-for="(article, index) in articles" :key="`article-snippet-${index}`">
      <div
        @click.stop="toggleCollapsed"
        :class="{ 'jw-study-aid-citation-item': true, collapsed }"
        :id="`jw-study-aid-citation-item-${id}`"
        :lang="lang"
      >
        <a
          class="publication-references-source-image"
          :href="url"
          target="_blank"
          :style="`background-color: ${article.thumbColor || '#ccc' }; background-image: url(${
            article.thumbnail || 'https://wol.jw.org/img/watchtower@3x.png'
          })`"
        >
          <i class="octicon octicon-unmute" ref="playBtn"></i>
          <i
            class="octicon octicon-versions"
            ref="showPubsBtn"
            @click.stop.prevent="showPubsClick"
          ></i>
          <i class="octicon octicon-file-pdf" v-if="false" ref="pdfBtn"></i>
        </a>
        <em ref="contentElement" class="article-processor-result">
          <strong class="scripture-citation-caption" v-if="article.caption">{{ article.caption }}</strong>
          <article v-html="article.content" class="wol-article"></article>
        </em>
        <div ref="referenceElement" class="publication-references-source" v-if="article.title">
          <a :href="article.url" class="publication-references-source-link" v-if="!secondary">
            &ldquo;{{ article.title }}&rdquo;
          </a>
          <a :href="article.url" class="publication-references-source-link-secondary" v-else>
            &ldquo;{{ article.title }}&rdquo;
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Wol from "@/lib/jw/Wol";
import $ from "jquery";

export default {
  data() {
    return {
      articles: [],
      parent: undefined,
      englishSymbol: undefined,
      id: undefined,
      itemId: undefined,
      docId: "",
      pageHtml: "",
      jwLangSymbol: "", // CHS
      pubSymbol: "", // g, wp, w
      issue: "", // 20120101
      caption_element: undefined,
      article_audio: undefined,
      data: undefined,
      thumbUrl: undefined,
      processFootnotesToggle: false,
      backgroundAudio: false,
      current_paragraph: 0,
      collapsed: true,
      secondary: false,
    };
  },
  props: {
    url: {
      type: String,
    },
    jsonUrl: {
      type: String,
    },
    article: {
      type: Object,
    },
    selector: {
      type: String,
      default: "#article",
    },
    snippet: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: "scripture", // or 'article'
    },
    lang: "en",
  },
  computed: {
    element() {
      return this.$el;
    },
    content_element() {
      return this.$refs["contentElement"];
    },
    reference_element() {
      return this.$refs["referenceElement"];
    },
    playBtn() {
      return this.$refs["playBtn"];
    },
    showPubsBtn() {
      return this.$refs["showPubsBtn"];
    },
    pdfBtn() {
      return this.$refs["pdfBtn"];
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  mounted() {
    this.id = new Date().getTime();
  },
  async fetch() {
    if (this.url) {
      this.articles = [
        await Wol.getArticle(this.url, {selector: this.selector, snippet: this.snippet, l1: this.$l1.code, l2: this.$l2.code}),
      ];
    } else if (this.jsonUrl) {
      this.articles = await Wol.getArticlesByJson(
        this.jsonUrl,
        this.selector,
        this.snippet
      );
    } else if (this.article) {
      this.articles = [this.article]
    }
  },
  methods: {

    showPubsClick() {
      if (this.type === "scripture") {
        let ref = BibleChapter.parseVerseId("v" + this.verseIds[0] + "-1");
        let enLangData = require("@/lib/jw/languages/en-US").default;
        let chapter = new BibleChapter(
          enLangData,
          1,
          ref.bookNum,
          ref.chapterNum
        );
        chapter.loadChapter(function () {
          BibleChapter.getReferences(
            this.url,
            this.verseIds,
            function ($referenceLinks) {
              let pubWrapper = BibleChapter.getPublicationSnippetsInWrapper(
                this.parent,
                this.element,
                $referenceLinks
              );
              $(this.element).after(pubWrapper);
            }
          );
          for (let verseId of this.verseIds) {
            let studyNotesWrapper =
              chapter.getStudyNotesSnippetsInWrapper(verseId);
            $(this.element).after(studyNotesWrapper);
            let mediaWrapper = chapter.getMediaSnippetsInWrapper(verseId);
            $(this.element).after(mediaWrapper);
          }
        });
      } else {
        let $referenceLinks = $(this.content_element).find(
          'a:not(.b):not([data-source="wikipedia"])'
        );
        let pubWrapper = BibleChapter.getPublicationSnippetsInWrapper(
          this.parent,
          this.element,
          $referenceLinks
        );
        $(this.element).after(pubWrapper);
        let $scriptureLinks = $(this.content_element).find("a.b");
        Article.lookupScriptureLinks(
          $scriptureLinks,
          this.parent,
          function (scriptureLink, scriptureSnippet) {
            $(this.element).after(scriptureSnippet.element);
            scriptureSnippet.activateSwipeToRemove();
          }
        );
      }
    },
    attach_buttons() {
      this.activateClickToPlay();
    },
    remove_loader() {
      $(this.loader).remove();
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
      if (!this.collapsed) {
        this.$el.scrollIntoView(false, {
          behavior: "smooth",
          // or "auto" or "instant"
          block: "center", // or "end"
        });
        window.scrollBy(0, 450);
      }
    },

    activateSwipeToRemove() {
      let snippet = this;
      $(snippet.element).show(function () {
        Swiped.init({
          query: "#" + snippet.itemId,
          right: 400,
          onOpen: function () {
            $(snippet.element).remove();
          },
        });
      });
    },

    loadVideos() {
      var snippet = this;
      $(this.content_element)
        .find(".videoContainer")
        .each(function (index) {
          var jsonUrl = $(this).attr("data-json-src");
          var posterUrl = $(this).attr("data-img-src");
          if (jsonUrl.indexOf("http") !== 0) {
            jsonUrl = snippet.wol.base_url + jsonUrl;
          }
          var videoContainer = this;
          var video = document.createElement("video");
          $(video).attr("controls", "");
          $(video).attr("preload", "meta");
          $(video).attr("webkit-playsinline", "");
          snippet.proxy.getJSON(encodeURIComponent(jsonUrl), function (data) {
            $(video).attr("poster", posterUrl);
            var trackNum = jsonUrl.replace(/.*&track=(\d+).*/, "$1");
            var videoSources;
            if (data.files.univ !== undefined) {
              videoSources = data.files.univ.MP4;
            } else {
              videoSources = data.files[langData.jwLangSymbol].MP4;
            }
            videoSources = videoSources.filter(function (file) {
              return file.track === Number(trackNum);
            });
            videoSources.reverse(); // Play highest resolution first
            $.each(videoSources, function (index, videoSource) {
              $(video).append('<source src="' + videoSource.file.url + '" />');
            });
            $(videoContainer).append(video);
          });
        });
    },

    /**
     * Loads the new content into the snippet (appends to and not replaces the existing content)
     * @param {*} content HTML of the new content to be added
     */
    set_content(content) {
      this.remove_loader();
      $(this.content_element).html("");
      this.addContent(content);
      this.augment();
    },

    addContent(content) {
      var $newContentElem = $("<p />").html(content);
      var debugCaption = $newContentElem.find(".mediaTitle p").first().text();
      $(this.content_element).append($newContentElem);
      // Put images on top
      var images = $newContentElem.find("img:not(.thumbnail)");
      if (images.length > 0) {
        this.addImageOnTop(images[0]);
      }
    },

    augment() {
      this.improve_article_presentation();
      if (this.type === "scripture") {
        this.improve_scripture_presentation();
      }
      this.activateSwipeToRemove();
      this.loadVideos();
      this.showPdfBtnIfAvailable();
    },

    add_content(content) {
      this.remove_loader();
      var $newContentElem = $("<p />").html(content);
      var debugCaption = $newContentElem.find(".mediaTitle p").first().text();
      $(this.content_element).html("");
      $(this.content_element).append($newContentElem);
      // Put images on top
      var images = $newContentElem.find("img:not(.thumbnail)");
      if (images.length > 0) {
        this.addImageOnTop(images[0]);
      }
      this.improve_article_presentation();
      if (this.type === "scripture") {
        this.improve_scripture_presentation();
      }

      this.activateSwipeToRemove();

      this.loadVideos();
    },

    getImageWrapper() {
      let imageWrapper = $(this.content_element).find("> .images")[0];
      if (imageWrapper) {
        return imageWrapper;
      }
    },

    addImageOnTop(imgElem) {
      if (this.getImageWrapper() === undefined) {
        let imageWrapper = $('<div class="images">')[0];
        this.content_element.prepend(imageWrapper);
      }
      $(this.getImageWrapper()).append(imgElem);
    },

    addImageAtBottom(imgElem) {
      if (this.getImageWrapper() === undefined) {
        let imageWrapper = $('<div class="images">')[0];
        this.content_element.append(imageWrapper);
      }
      $(this.getImageWrapper()).append(imgElem);
    },

    addImageSrcOnTop(src) {
      var image = $("<img />")[0];
      $(image).attr("src", src);
      this.addImageOnTop(image);
    },

    addImageSrcAtBottom(src) {
      var image = $("<img />")[0];
      $(image).attr("src", src);
      this.addImageAtBottom(image);
      $(this.loader).remove();
    },

    load_html(html) {
      this.remove_loader();
      this.set_content(html);
    },

    load_json(data, callback = function () {}) {
      var snippet = this;
      this.data = data;
      if (data.items[0].imageUrl === "https://wol.jw.org/undefined") {
        data.items[0].imageUrl = "https://wol.jw.org/img/container.png";
      }
      this.set_thumbnail(data.items[0].imageUrl);
      this.englishSymbol = data.items[0].englishSymbol;
      snippet.set_content("");
      $.each(data.items, function (key, item) {
        // Set type based on data
        if (item.articleClasses.indexOf("publicationCitation") !== -1) {
          snippet.type = "article";
        } else if (item.articleClasses.indexOf("bibleCitation") !== -1) {
          snippet.type = "scripture";
        }
        snippet.docId = item.articleClasses.replace(/.*docId-(\d+).*/, "$1");
        var contentHtml = item.content;
        snippet.addContent(contentHtml);
        // Alternative presentations
        if (item.substitutes && item.substitutes.length > 0) {
          for (var substitute of item.substitutes) {
            if (
              substitute.targetType === "svg" ||
              substitute.targetType === "jpg" ||
              substitute.targetType === "png"
            ) {
              var $image = $(
                '<img src="' +
                  snippet.wol.base_url +
                  substitute.targetUrl +
                  '" />'
              );
              snippet.content_element.prepend($image[0]);
            }
          }
        }
        if (snippet.type === "scripture") {
          snippet.add_scripture_caption(data.items[0].caption);
        }
        $(snippet.content_element)
          .find("a")
          .each(function () {
            var href = $(this).attr("href");
            var newHref = snippet.wol.jsonUrlToHtmlUrl(href);
            $(this).attr("href", newHref);
          });
      });
      snippet.augment();
      callback();
    },

    improve_article_presentation() {
      $(this.content_element).find(".qu").remove();
      $(this.content_element).find("a").attr("onclick", "return false");
    },

    set_please_read(pleaseReadText) {
      if (this.caption_element !== null) {
        $(this.caption_element).text(
          pleaseReadText + $(this.caption_element).text()
        );
      }
    },

    add_scripture_caption(captionText) {
      // Add caption
      this.caption_element = $(
        '<strong class="scripture-citation-caption">' + captionText + "</span>"
      )[0];
      $(this.content_element).prepend(this.caption_element);
    },

    improve_scripture_presentation() {
      // Replace all paragraphs and divs in the scripture with spans
      var improvedHtml = $(this.content_element)
        .html()
        .replace(/<p/g, "<span")
        .replace(/<\/p>/g, "</span>");
      improvedHtml = improvedHtml
        .replace(/<div/g, "<span")
        .replace(/<\/div>/g, "</div>");

      $(this.content_element).html(improvedHtml);

      // Remove links in scripture
      $(this.content_element).find(".b").remove();
      $(this.content_element).find(".vl, .cl").first().remove();
      $(this.content_element)
        .find(".vl, .cl")
        .each(function () {
          $(this).replaceWith(
            '<strong class="' +
              $(this).attr("class") +
              '">' +
              $(this).text() +
              "</strong>"
          );
        });
    },

    showPdfBtnIfAvailable() {
      let articleSnippet = this;
      this.getPdfUrl(function (pdfUrl, pageNums) {
        $(articleSnippet.pdfBtn).removeClass("hidden");
        $(articleSnippet.pdfBtn).click(function () {
          window.open(pdfUrl + "#page" + pageNums[0]);
        });
      });
    },

    add_audio_player(jwLangSymbol) {
      var wol = new Wol();
      let articleSnippet = this;
      wol.getArticleAudioThen(
        jwLangSymbol,
        this.docId,
        this,
        function (data, context) {
          var $audioWrapper = $(
            '<div class="jw-study-aid-citation-audio-bar" />'
          );
          $(context.element).find("em").first().before($audioWrapper);
          var $player = $(
            '<audio controls preload="none"><source src="' +
              data.audio_url +
              '" type="audio/mpeg" />Your browser does not support the audio element.</audio>'
          );
          if (articleSnippet.backgroundAudio === true) {
            $player.attr("data-background-playback", "true");
          }
          $audioWrapper.html($player.get(0));
          // Pause all other audios that are not the current playing audio
          document.addEventListener(
            "play",
            function (e) {
              var audios = document.getElementsByTagName("audio");
              for (var i = 0, len = audios.length; i < len; i++) {
                if (
                  audios[i] !== e.target &&
                  $(audios[i]).attr("data-background-playback") !== "true"
                ) {
                  audios[i].pause();
                }
              }
              if (data.mp3 && data.mp3.markers)
                context.advance_publication_audio_to_first_paragraph_in_segment();
            },
            true
          );
        }
      );
    },

    processFootnotes() {
      var scriptureSnippet = this;
      $(scriptureSnippet.content_element)
        .find(".fn")
        .each(function () {
          var url = $(this).attr("href");
          var footnoteId = $(this).attr("data-fnid");
          // Load the footnote data
          scriptureSnippet.proxy.getJSON(
            scriptureSnippet.wol.htmlUrlToJsonUrl(url),
            function (data) {
              if (data) {
                // When done, find the footnote link (using data-fnid to match)
                // And replace with the new content
                var $footnoteLink = $(scriptureSnippet.content_element).find(
                  'a[data-fnid="' + footnoteId + '"]'
                );
                var $footnoteContent = $(data.content).text();
                $footnoteLink.replaceWith(
                  ' <span class="in-verse-footnote">[' +
                    $footnoteContent +
                    "]</span> "
                );
              }
            }
          );
        });
    },

    first_paragraph_num() {
      return $($(this.element).find("[data-pid]")[0]).attr("data-pid");
    },

    advance_publication_audio_to_first_paragraph_in_segment() {
      this.article_audio.advance_to_paragraph(this.first_paragraph_num());
    },

    pausePlaying() {
      $(".octicon.octicon-primitive-square").each(function () {
        $(this).attr("class", "octicon octicon-unmute");
      });
      window.speechSynthesis.pause();
      window.speechSynthesis.cancel();
    },

    stopExistingSpeech() {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    },

    prepareTextForSpeech($richtext) {
      let snippet = this;
      $richtext.find("sup").remove();
      $richtext.find(".b").each(function () {
        $(this).text(snippet.pronounceScriptureFull($(this).text()));
      });
      $richtext.find(".in-verse-footnote").remove();
      var text = $richtext.text();
      // Remove pronounciation guides
      text = text.replace(/ʹ/g, "");
      text = text.replace(/·/g, "");
      text = text.replace(/Lit\./g, "Literally");
      text = text.replace(/App\./g, "Appendix");
      text = text.replace(/\bmi\b/g, " miles");
      text = text.replace(/\bin\./g, " inches");
      text = text.replace(/\bftn\./g, " footnote");
      text = text.replace(/B\.C\.E\.\s/g, " BCE. ");
      text = text.replace(/B\.C\.E\./g, " BCE ");
      text = text.replace(/C\.E\.\s/g, " CE. ");
      text = text.replace(/C\.E\./g, " CE ");
      text = text.replace(/\bN\./g, " north ");
      text = text.replace(/\bE\./g, " east ");
      text = text.replace(/\bS\./g, " south ");
      text = text.replace(/\bW\./g, " west ");
      text = text.replace(/\bNE\b/g, " northeast ");
      text = text.replace(/\bNW\b/g, " northwest ");
      text = text.replace(/\bSE\b/g, " southeast ");
      text = text.replace(/\bSW\b/g, " southwest ");
      text = text.replace(/—See study note.*/g, "");
      return text;
    },

    // Pronounce Ge 1 as Genesis 1
    pronounceScriptureFull(reference) {
      var fullRef = reference;
      if (langData.books[0].official !== undefined) {
        for (var book of langData.books) {
          fullRef = fullRef
            .replace(book.name, book.official)
            .replace(book.official, book.abbreviation)
            .replace(book.abbreviation, book.name);
          fullRef = fullRef.replace("-", langData.to);
        }
      }
      return fullRef;
    },

    pronounceReferenceFull(reference) {
      var fullRef = reference.replace(/[Aa]pp./, "appendix");
      fullRef = fullRef.replace(
        /((\d+)：(\d+))/,
        langData.chapterVerseReplacement
      );
      return fullRef;
    },

    speak(text) {
      var utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = $("html").attr("lang");
      var preferredVoices = [
        "Google US English",
        "Google UK English Male",
        "Google UK English Female",
        "Google 普通话（中国大陆）",
      ];
      var voices = window.speechSynthesis.getVoices();
      for (var preferredVoice of preferredVoices) {
        var foundVoices = voices.filter(function (voice) {
          if (voice.lang === utterance.lang && voice.name === preferredVoice) {
            return true;
          }
        });
        if (foundVoices !== undefined && foundVoices.length > 0) {
          utterance.voice = foundVoices[0];
          break;
        }
      }
      window.speechSynthesis.speak(utterance);
    },

    // When you click on the publication image, let the computer read it to you
    activateClickToPlay() {
      var snippet = this;
      $(this.element)
        .find(
          ".publication-references-source-image i.octicon-unmute, .publication-references-source-image i.primitive-square"
        )
        .click(function (e) {
          if ($(this).hasClass("octicon-unmute")) {
            if (e) {
              e.preventDefault();
              e.stopPropagation();
            }
            var text = snippet.constructor.prepareTextForSpeech(
              $(snippet.element).find("em").first().clone()
            );

            // Stop existing speech
            snippet.constructor.pausePlaying();
            if (parent.articleAudio) {
              snippet.parent.articleAudio.pause();
            }
            // Change all other icons to "play" icon
            $(this.element)
              .find(
                ".publication-references-source-image i.octicon-primitive-square"
              )
              .attr("class", "octicon octicon-unmute");
            // Change this icon to "stop" icon
            $(this).attr("class", "octicon octicon-primitive-square");
            var segments = text.split(/:\s|\)\s|\.\s|\.”|。/);
            for (var segment of segments) {
              snippet.constructor.speak(segment);
            }
          } else if ($(this).hasClass("octicon-primitive-square")) {
            if (e) {
              e.preventDefault();
              e.stopPropagation();
            }
            snippet.constructor.pausePlaying();
          }
        });
    },

    addExtraImage() {
      var articleSnippet = this;
      // Add an image on top of the snippet if there is none
      if (
        $(articleSnippet.content_element).find("img:not(.thumbnail)").length ===
        0
      ) {
        articleSnippet.wol.getArticleHtmlThen(
          articleSnippet.url,
          function (html) {
            articleSnippet.pageHtml = html;
            var $images = $(html).find("img:not(.thumbnail)");
            var imageAdded = false;
            if ($images.length > 0) {
              // Optionally track images
              if (!articleSnippet.parent.seenImages) {
                articleSnippet.parent.seenImages = [];
              }
              var i = 0;
              while (i < $images.length) {
                var src = $($images[i]).attr("src");
                if (articleSnippet.parent.seenImages.indexOf(src) === -1) {
                  articleSnippet.parent.seenImages.push(src);
                  articleSnippet.addImageOnTop($images[0]);
                  imageAdded = true;
                }
                i++;
              }
            }
            if (!imageAdded) {
              // articleSnippet.loadPdf()
            }
          }
        );
      }
    },

    getPageNums(callback) {
      var articleSnippet = this;
      if (articleSnippet.pageNums) {
        return articleSnippet.pageNums;
      } else {
        if (articleSnippet.pageHtml !== "") {
          articleSnippet.pageNums = Article.getPageNumsFromHtml(
            articleSnippet.pageHtml
          );
          if (callback) {
            callback(articleSnippet.pageNums);
          }
        } else {
          articleSnippet.wol.getArticleHtmlThen(this.url, function (html) {
            articleSnippet.pageHtml = html;
            articleSnippet.getPageNums(callback);
          });
        }
      }
    },

    getIssue() {
      return $(this.pageHtml).find("#issue").val();
    },

    pubScansExist(callbackTrue, callbackFalse = function () {}) {
      let articleSnippet = this;
      $.getJSON("/wp-json/scans/list", function (data) {
        if (data.pubs.indexOf(articleSnippet.englishSymbol) !== -1) {
          callbackTrue();
        } else {
          callbackFalse();
        }
      });
    },

    loadScans() {
      let articleSnippet = this;
      let pageOffsets = {
        "it-1": 2,
        "it-2": 2,
        bt: 2,
        re: 3,
        be: 3,
        jy: 4,
        yp1: 4,
        yp2: 4,
      };
      let pageOffset = pageOffsets[articleSnippet.englishSymbol];
      let loaded = false;
      $(this.loader).remove();
      for (let pageNum of this.pageNums) {
        if (pageOffset !== undefined) {
          pageNum = pageNum + pageOffset;
        }
        let scanUrl = articleSnippet.getScanPage(
          articleSnippet.englishSymbol,
          pageNum
        );
        if (this.constructor.seenScanUrls().indexOf(scanUrl) === -1) {
          this.constructor.seenScanUrls().push(scanUrl);
          let putAtBottom = ["it-1", "it-2"];
          if (putAtBottom.indexOf(articleSnippet.englishSymbol) !== -1) {
            articleSnippet.addImageSrcAtBottom(scanUrl);
          } else {
            articleSnippet.addImageSrcOnTop(scanUrl);
          }
          loaded = true;
        }
      }
      if (!this.thumbUrl) {
        this.set_thumbnail(
          articleSnippet.getScanPage(articleSnippet.englishSymbol, 1)
        );
      }
      return loaded;
    },

    getScanPage(englishSymbol, pageNum) {
      let padFour = ["it-1", "it-2", "ct", "si"];
      let padNum = padFour.indexOf(englishSymbol) !== -1 ? 4 : 3;
      let scanImageUrl =
        config.dataUploadsUrl +
        "scans/" +
        englishSymbol +
        "/" +
        englishSymbol +
        "_Page_" +
        Helper.pad(pageNum, padNum) +
        ".jpg";
      return scanImageUrl;
    },

    loadPdf() {
      let articleSnippet = this;
      let bannedPubs = ["nwt"];
      let issue = articleSnippet.getIssue();
      let pub = articleSnippet.getPubSymbol(issue);
      if (bannedPubs.indexOf(pub) === -1 && issue) {
        // We don't want books for now-files too large
        articleSnippet.getPdfUrl(function (pdfUrl, pageNums) {
          pdfUrl = config.pdfProxyBase + pdfUrl;
          articleSnippet.pubScansExist(
            function () {
              articleSnippet.loadScans();
            },
            function () {
              articleSnippet.renderPDF(pdfUrl, pageNums);
            }
          );
        });
      }
    },

    getPdfUrl(callback) {
      var articleSnippet = this;
      if (articleSnippet.englishSymbol !== undefined) {
        articleSnippet.getPageNums(function (pageNums) {
          let issue = articleSnippet.getIssue();
          var pub = articleSnippet.getPubSymbol(issue);
          var url =
            "https://apps.jw.org/GETPUBMEDIALINKS?" +
            $.param({
              issue: issue,
              output: "json",
              pub: pub,
              fileformat: "EPUB,MOBI,PDF,RTF,TXT,BRL,BES",
              alllangs: 0,
              langwritten: langData.jwLangSymbol,
              txtCMSLang: langData.jwLangSymbol,
            });
          $.getJSON({
            url: url,
            success: function (json) {
              if (
                json.files &&
                json.files[langData.jwLangSymbol] &&
                json.files[langData.jwLangSymbol].PDF
              ) {
                console.log(json.files[langData.jwLangSymbol].PDF);
                var pdfUrl = json.files[langData.jwLangSymbol].PDF[0].file.url; // stream or url
                if (pdfUrl.indexOf("lp") != -1) {
                  pdfUrl = json.files[langData.jwLangSymbol].PDF[1].file.url;
                }
                callback(pdfUrl, pageNums);
              }
            },
          });
        });
      }
    },

    renderPDF(pdfUrl, pageNums) {
      var articleSnippet = this;
      // PDFJS.workerSrc = config.jsDirUrl + 'pdfjs/pdf.worker.js'
      var pdfWrapper = $('<div class="pdf" />')[0];
      $(articleSnippet.content_element).prepend(pdfWrapper);
      PDFJS.getDocument(pdfUrl).then(function (pdf) {
        for (let pageNum of pageNums) {
          pdf.getPage(pageNum).then(function (page) {
            var $canvas = $("<canvas />");
            var pdfId = "snippet-pdf-" + articleSnippet.id + "-" + pageNum;
            $canvas.attr("id", pdfId);
            $(pdfWrapper).append($canvas[0]);

            var scale = 1.5;
            var viewport = page.getViewport(scale);
            var canvas = document.getElementById(pdfId);
            var context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            var renderContext = {
              canvasContext: context,
              viewport: viewport,
            };
            page.render(renderContext);
          });
        }
      });
    },

    // data.items[0].englishSymbol = w04
    // docId = 2004206
    // => w / wp
    getPubSymbol(issue = undefined) {
      this.pubSymbol = this.data.items[0].englishSymbol; // w09, it-1
      if (
        this.pubSymbol.indexOf("w") === 0 ||
        this.pubSymbol.indexOf("g") === 0
      ) {
        this.pubSymbol = this.pubSymbol.replace(/\d/g, ""); // w
      }
      if (this.pubSymbol === "w" && issue && issue.match(/01$/)) {
        // 20090501
        this.pubSymbol = "wp";
      }
      return this.pubSymbol;
    },

    seenScanUrls() {
      if (!this.scanUrls) {
        this.scanUrls = [];
      }
      return this.scanUrls;
    },
  },
};
</script>

<style>
.jw-study-aid-citation-item {
  /* background-color: #f4f1f0; */
  padding: 0 3rem 0 0;
  list-style: none;
  margin: 0.1rem 0 1rem 0;
  position: relative;
  min-height: 8rem;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: all 0.5s ease-in-out;
  border-radius: 0.25rem;
}

h1 .jw-study-aid-citation-item,
h2 .jw-study-aid-citation-item,
h3 .jw-study-aid-citation-item,
h4 .jw-study-aid-citation-item,
h5 .jw-study-aid-citation-item,
h6 .jw-study-aid-citation-item {
  font-weight: normal;
}

.jw-study-aid-citation-item:not(.collapsed) {
  min-height: inherit;
}

button + .jw-study-aid-citation-item {
  margin-top: 0;
}

@media (max-width: 768px) {
  .jw-study-aid-citation-item:not(.collapsed)
    .jw-study-aid-citation-audio-bar
    audio {
    padding: 0 2em;
  }
}

@media (max-width: 480px) {
  .jw-study-aid-citation-item {
    margin-left: 0;
  }
}

.jw-study-aid-citation-item::before {
  content: " ";
  display: none;
  position: absolute;
  right: -1.3rem;
  top: 1rem;
  border-top: 0.5rem solid;
  border-right: 0.7rem solid;
  border-bottom: 0.5rem solid;
  border-left: 0.7rem solid;
  border-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) #f4f1f0;
}

.jw-study-aid-citation-item:not(.collapsed) {
  margin-right: 0;
  z-index: 1;
  padding-right: 0;
}

.jw-study-aid-citation-item:not(.collapsed)::before {
  display: none;
}

.jw-study-aid-citation-item:not(.collapsed)
  .publication-references-source-image {
  opacity: 0;
  right: 0;
  pointer-events: none;
}

.jw-study-aid-citation-item.collapsed > em {
  max-height: 10rem;
  position: relative;
  min-height: 7rem;
}

/* Fadeout gradient */
.jw-study-aid-citation-item.collapsed > em > *:last-child::after {
  content: " ";
  width: 100%;
  height: 2rem;
  position: absolute;
  top: calc(100% - 2rem);
  left: 0;
  background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
}

.jw-study-aid-citation-item.collapsed.please-read > em > *:last-child::before {
  background: linear-gradient(rgba(241, 246, 254, 0), #f1f6fe);
}

.jw-study-aid-citation-item.collapsed.please-read > em > *:last-child::after {
  box-shadow: 0 -0.5rem 0 #f1f6fe;
}

.jw-study-aid-citation-item > em {
  display: block;
  font-style: normal;
  max-width: 700px;
  margin: 0 auto;
  padding: 1rem 1rem 0 1rem;
  overflow: hidden;
}

.jw-study-aid-citation-item > em a {
  text-decoration: none;
  color: #758cb1;
}

.jw-study-aid-citation-item > em canvas {
  max-width: 100%;
}

html[lang="zh-CN"] .jw-study-aid-citation-item em,
html[lang="ko-KR"] .jw-study-aid-citation-item em {
  font-style: normal;
}

.jw-study-aid-citation-item h1,
.jw-study-aid-citation-item h2,
.jw-study-aid-citation-item h3,
.jw-study-aid-citation-item h4 {
  padding-top: 0;
}

.jw-study-aid-citation-item .publication-references-source-image {
  width: 3rem;
  height: 100%;
  display: block;
  background-size: 3rem;
  background-color: #fbfbfb;
  background-repeat: no-repeat;
  position: absolute;
  right: 0;
  top: 0;
  opacity: 1;
  box-shadow: none;
}

.jw-study-aid-citation-item em h1 {
  font-size: 1.2em;
  margin: 1rem 0;
}

.jw-study-aid-citation-item em h2 {
  font-size: 1.1em;
  margin: 1rem 0;
}

.publication-references-source-link,
.publication-references-source-link-secondary {
  text-decoration: none !important;
  font-size: 0.8em;
  box-shadow: none !important;
  color: #aaa !important;
  text-align: right;
  margin-right: 0.5rem;
}

.publication-references-source-link {
  font-weight: bold;
}

.jw-study-aid-citation-item
  .publication-references-source-link::hover
  .jw-study-aid-citation-item
  .publication-references-source-link-secondary::hover {
  box-shadow: none !important;
  color: #aaa !important;
  text-decoration: none !important;
}

.publication-references-source-link-secondary {
  font-style: italic;
}

/* Speech icon */
.publication-references-source-image i.octicon {
  cursor: pointer;
  width: 3rem;
  height: 2rem;
  color: white;
  font-size: 1.5rem;
  line-height: 3rem;
  text-align: center;
  position: absolute;
}

.publication-references-source-image i.octicon-unmute,
.publication-references-source-image i.octicon-primitive-square {
  top: 3rem;
}

.publication-references-source-image i.octicon-versions {
  top: 5rem;
}

.publication-references-source-image i.octicon-file-pdf {
  top: 7rem;
}

.jw-study-aid-citation-item .images {
  margin: -1rem -1rem 0 -1rem;
}

.jw-study-aid-citation-item > em > p:first-child,
.jw-study-aid-citation-item > em > p:last-child {
  margin-bottom: 0;
}

.jw-study-aid-citation-item .in-verse-footnote {
  font-style: italic !important;
  color: #999;
}

.publication-references-source {
  padding: 0 1rem 1rem 1rem;
  line-height: 1.25;
}
</style>