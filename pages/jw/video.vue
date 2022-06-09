<router>
  {
    path: '/:l1/:l2/video',
  }
</router>
<template>
  <div class="container mx-auto mt-10">
    <div class="video-processor-player-wrapper"></div>
    <div class="video-processor-title"></div>
    <div class="video-processor-transcript">
      <span class="throbber-loader">Loading&#8230;</span>
    </div>
    <div class="video-processor-link">
      <img class="video-processor-link-image" />
      <br />
      <a class="video-processor-link-title"></a>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/Helper";
import Wol from "@/lib/Wol";
import config from "@/lib/Config";
import $ from "jquery";
import langData from "@/lib/languages/en-US";

export default {
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  methods: {
    constructor(
      options = {
        selector: undefined,
        videoSources: undefined,
        posterUrl: undefined,
        vid: undefined,
        startTime: 0,
        highlight: undefined,
      }
    ) {
      if (options !== undefined) {
        for (var key in options) {
          this[key] = options[key];
        }
      }
      this.video = undefined;
      this.sources = [];
      this.subtitlesElem = $("<div />")[0];
      this.wol = new Wol(config.wol_base_url);
      this.id = new Date().getTime();
      if (this.selector) {
        this.element = $(this.selector)[0];
      } else {
        this.element = $('<div class="jw-study-aid-video" />');
      }
      this.loadTemplate();
    },

    activateClickVerseToPlay() {
      let video = this;
      $(video.element)
        .find("[data-start-time]")
        .click(function (event) {
          event.stopPropagation();
          let startTimeStr = $(this).attr("data-start-time");
          let startTimeSeconds = Number(startTimeStr);
          video.video.currentTime = startTimeSeconds + 0.0001;
        });
    },

    getVideoSnippet(
      vid,
      startTime = 0,
      highlight = undefined,
      parent = undefined
    ) {
      // for each verse, create a snippet and attach
      let videoSnippet = new ArticleSnippet({
        parent: parent,
      });
      let wol = new Wol();
      wol.getVideo(vid, function (json) {
        let thumbUrl = json.media[0].images.sqr.sm;
        // load the video into the snippet
        let vidData = Video.processVideoData(json);
        let video = new Video({
          vid: vid,
          videoSources: vidData.videoSources,
          posterUrl: vidData.posterUrl,
          startTime: Number(startTime),
          highlight: highlight,
        });
        videoSnippet.remove_loader();
        videoSnippet.set_thumbnail(thumbUrl);
        videoSnippet.activateSwipeToRemove();
        $(videoSnippet.content_element).append(video.element);
      });
      return videoSnippet;
    },

    activateVerseHighlighting() {
      let video = this;
      video.video.ontimeupdate = function () {
        // Get current playhead time
        var currentTime = this.currentTime;
        var currentTimeStr = "";
        // Go through each verse in the transcript, starting from the last
        $.each(
          $(video.element)
            .find(".video-processor-transcript span")
            .get()
            .reverse(),
          function () {
            var timeStr = $(this).attr("data-start-time");
            var verseStartTimeSeconds = Number(timeStr);
            // If current time (playhead) is past the start time of the verse
            if (currentTime > verseStartTimeSeconds) {
              if (currentTimeStr !== timeStr) {
                currentTimeStr = timeStr;
                video.highlightVerse(currentTimeStr);
                // var verseSpan = $(video.element).find('span[data-start-time="' + currentTimeStr + '"]')[0]
                // if (!Helper.isInView(verseSpan)) {
                //   if (video.video.paused === false) {
                //     verseSpan.scrollIntoView(false, {
                //       behavior: 'smooth',
                //       // or "auto" or "instant"
                //       block: 'center' // or "end"
                //     })
                //     window.scrollBy(0, 300)
                //   }
                // }
              }
              return false;
            }
          }
        );
      };
    },

    highlightVerse(currentTimeStr) {
      let video = this;
      let subtitlesElem = $(video.element).find(
        ".video-processor-transcript"
      )[0];
      let currentVerseSpan = $(subtitlesElem).find(
        'span[data-start-time="' + currentTimeStr + '"]'
      )[0];
      $(subtitlesElem)
        .find('span:not([data-start-time="' + currentTimeStr + '"])')
        .removeClass("current-marker");
      $(currentVerseSpan).addClass("current-marker");
      Helper.scrollParentToChild(subtitlesElem, currentVerseSpan);
    },

    loadTemplate() {
      let video = this;
      $(video.element).load(
        config.templates_url + "video.html",
        function (html) {
          video.processVideoSources(
            video.videoSources,
            video.posterUrl,
            video.vid
          );
          video.constructor.getSubtitles(
            video.videoSources,
            function (subtitles) {
              if (subtitles) {
                video.subtitlesElem = video.constructor.processSubtitles(
                  subtitles,
                  video.vid
                ).subtitlesElem;
                $(video.element)
                  .find(".video-processor-transcript")
                  .html(video.subtitlesElem);
                video.activateVerseHighlighting();
                // Activate click verse to play
                video.activateClickVerseToPlay();
                if (video.highlight !== undefined) {
                  video.highlightSubtitle(video.highlight);
                }
              } else {
                $(video.subtitlesElem).html("");
              }
            }
          );
        }
      );
    },

    highlightSubtitle(highlight) {
      console.log(highlight);
      let video = this;
      let subtitlesElem = $(video.element).find(
        ".video-processor-transcript"
      )[0];
      $(subtitlesElem)
        .find("span")
        .each(function () {
          let span = this;
          let spanHtml = $(span).html();
          let spanHtmlWithHighlight = spanHtml.replace(
            new RegExp(`(${highlight})`, "gi"),
            `<span class="highlight">$1</span>`
          );
          if (spanHtmlWithHighlight !== spanHtml) {
            $(span).html(spanHtmlWithHighlight);
            console.log(span);
          }
        });
      let firstHighlight = $(subtitlesElem).find(".highlight")[0];
      Helper.scrollParentToChild(subtitlesElem, firstHighlight);
    },

    processVideoData(json, vid) {
      if (json.media[0].files) {
        var videoTitle = json.media[0].title;
        var videoSources = [];
        if (json.media[0].images.wss) {
          var posterUrl = json.media[0].images.wss.lg;
        }
        $.each(json.media[0].files, function (index, file) {
          videoSources.push({
            url: file.progressiveDownloadURL,
            mimetype: this.mimetype,
            subtitles: this.subtitles,
            category: json.media[0].primaryCategory,
            images: json.media[0].images,
            title: videoTitle,
          });
        });
        return {
          videoSources: videoSources,
          posterUrl: posterUrl,
        };
      }
    },

    processVideoSources(videoSources, posterUrl, vid) {
      let video = this;
      // Load video
      // video_files[3].file.url is 720p
      video.video = $(
        '<video preload="none" vid="' +
          video.vid +
          '"controls webkit-playsinline playsinline poster="' +
          posterUrl +
          '" />'
      )[0];
      $.each(videoSources.reverse(), function (index, videoSource) {
        let source = $(
          '<source src="' +
            videoSource.url +
            '" type="' +
            videoSource.mimetype +
            '" />'
        )[0];
        video.sources.push(source);
        $(video.video).append(source);
      });
      $(video.video).append("Your browser does not support HTML5 video.");
      $(video.element)
        .find(".video-processor-player-wrapper")
        .append(video.video);

      // Add the title
      $(video.element)
        .find(".video-processor-title")
        .html("<h3>" + videoSources[0].title + "</h3>");
      $(video.element).find(".video-processor-transcript").html("");
      $(video.element)
        .find(".video-processor-link-image")
        .attr("src", videoSources[0].images.wss.sm);
      $(video.element)
        .find(".video-processor-link-title")
        .attr("href", langData.video_url + videoSources[0].category + "/" + vid)
        .text(videoSources[0].title);
      if (video.startTime) {
        $(video.video).one("canplay", function () {
          video.video.currentTime = Number(video.startTime);
        });
      }
    },

    getSubtitles(videoSources, callback) {
      // Load subtitles
      var subtitles = videoSources[0].subtitles;
      if (subtitles) {
        var subtitlesUrl = videoSources[0].subtitles.url;
        proxy.ajax(encodeURIComponent(subtitlesUrl), function (subtitles) {
          callback(subtitles);
        });
      } else {
        callback(false);
      }
    },

    processSubtitles(subtitles, vid) {
      var subtitlesHtml = subtitles.replace(/^WEBVTT/, "");
      subtitlesHtml = subtitlesHtml.replace(
        /.*\n\n(([\d:.]+) --> ([\d:.]+)\n((.+\n)+))/gm,
        function (match, $1, $2, $3, $4) {
          return (
            '<span data-start-time="' +
            Helper.parseTime($2) +
            '" data-end-time="' +
            Helper.parseTime($3) +
            '">' +
            $4 +
            "</span>"
          );
        }
      );
      let elem = $("<div />").html(subtitlesHtml)[0];
      var verseArray = $(elem).find("span").get();
      var data = { lines: [] };
      var $div = $("<div />");
      var $paragraph = $("<p></p>");
      for (var i = 0; i < verseArray.length - 1; i++) {
        if (i + 1 < verseArray.length) {
          var thisParagraphStartTime = Number(
            $(verseArray[i]).attr("data-start-time")
          );
          var thisParagraphEndTime = Number(
            $(verseArray[i]).attr("data-end-time")
          );
          var nextParagraphStartTime = Number(
            $(verseArray[i + 1]).attr("data-start-time")
          );
          var line = {
            vid: vid,
            text: $(verseArray[i]).text().replace(/\n/g, ""),
            start: thisParagraphStartTime,
          };
          data.lines.push(line);
          $paragraph.append($.clone(verseArray[i]));
          // If next paragraph starts a longtime after
          if (nextParagraphStartTime - thisParagraphEndTime > 0.05) {
            $div.append($paragraph.clone());
            $paragraph.html("");
          }
        }
      }
      $div.append($paragraph.clone());
      let subtitlesElem = $div[0];

      return {
        data: data,
        subtitlesElem: subtitlesElem,
      };
    },
  },
};
</script>

<style>
.video-processor-transcript .current-marker {
  background: #d7e6ff;
  box-shadow: 0 0 4px 4px #d7e6ff;
}

.video-processor-controls {
  margin-bottom: 2rem;
}

.video-processor-video-list {
  display: flex;
  flex-wrap: wrap;
}

.video-processor-video-list-item {
  list-style: none;
  width: 50%;
  padding: 0.1rem;
  margin-bottom: 1rem;
}

.video-processor-video-list-item a {
  box-shadow: none !important;
  border: none !important;
}

.video-processor-video-list-item-image {
  box-shadow: none !important;
}

.video-processor-video-list-item-title {
  padding: 0 0.5rem;
}

.back-to-videos-btn {
  margin-bottom: 1rem;
  background: #eaeaea;
  color: #3c3c3c;
  border-radius: 0.3rem;
  padding: 0.5rem 1rem;
}

.back-to-videos-btn::before {
  content: "< ";
}

.video-processor-transcript {
  margin-bottom: 2rem;
}

.video-processor-transcript span {
  cursor: pointer;
}

.video-processor-transcript {
  max-height: 16rem;
  overflow: scroll;
  padding: 1rem;
  background: #f8f8f8;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2) inset;
}

.video-processor-controls-bottom p {
  width: 100%;
}

.video-processor-controls-bottom input {
  flex: 1;
}

.video-processor-controls-bottom {
  display: flex;
  flex-wrap: wrap;
  margin-top: 2rem;
  border-top: 1px solid #ccc;
  padding-top: 2rem;
}

.video-processor-title {
  margin-top: 1rem;
}

.video-processor-transcript .highlight {
  background: yellow;
}
</style>