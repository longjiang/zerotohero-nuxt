<template>
  <div class="jw-study-aid-audio-bar sticky">
    <div
      :class="'audio-bar-controls audio-bar-controls-article'"
      v-if="type === 'article' && article"
    >
      <ArticleAudio
        v-if="audioData && articleAudioOptions"
        :audio_data="audioData"
        :options="articleAudioOptions"
        ref="player"
      />
      <router-link
        v-if="article.prevUrl"
        :to="article.prevUrl"
        class="article-prev-button media-bar-button"
        title="Previous"
      >
        <i class="octicon octicon-chevron-left"></i>
      </router-link>
      <router-link
        v-if="article.contentsUrl"
        :to="article.contentsUrl"
        class="article-contents-button media-bar-button"
        title="Contents"
      >
        <i class="octicon octicon-book"></i>
      </router-link>
      <router-link
        v-if="article.nextUrl"
        :to="article.nextUrl"
        class="article-next-button media-bar-button"
        title="Next"
      >
        <i class="octicon octicon-chevron-right"></i>
      </router-link>
      <button
        class="maximize-all-refs-button media-bar-button"
        @click="toggleMaximizeAllRefs"
      >
        <i class="fas fa-expand"></i>
      </button>
      <button
        class="hide-random-line media-bar-button"
        title="Hide random paragraphs"
        @click="toggleHideRandomParagraphs"
      >
        <i class="octicon octicon-eye"></i>
      </button>
      <button
        class="random-button media-bar-button"
        title="Open random link"
        @click="randomLink"
      >
        <i class="octicon octicon-telescope"></i>
      </button>
      <button
        class="point-form-button media-bar-button"
        title="Convert to point form"
        @click="togglePointForm"
      >
        <i class="octicon octicon-list-unordered"></i>
      </button>
    </div>
    <div
      :class="'audio-bar-controls audio-bar-controls-bible-chapter'"
      v-if="type === 'bible-chapter'"
    >
      <ArticleAudio
        v-if="audioData && articleAudioOptions"
        :audio_data="audioData"
        :options="articleAudioOptions"
        ref="player"
      />
      <button class="reference-status" @click="refStatusClick">
        {{ refStatus }}
      </button>
      <div class="verse-nav">
        <button class="verse-nav-prev media-bar-button" @click="verseNavPrev">
          <i class="octicon octicon-chevron-up"></i>
        </button>
        <button class="verse-nav-next media-bar-button">
          <i class="octicon octicon-chevron-down" @click="verseNavNext"></i>
        </button>
      </div>
      <button
        class="maximize-all-refs-button media-bar-button"
        @click="toggleMaximizeAllRefs"
      >
        <i class="fas fa-expand"></i>
      </button>
      <button class="load-refs-button media-bar-button" @click="loadRefs">
        <i class="octicon octicon-versions"></i>
      </button>
      <button
        class="expand-map-button media-bar-button"
        title="show-map"
        @click="toggleMap"
      >
        <i class="octicon octicon-globe"></i>
      </button>
      <button
        class="expand-timeline-button media-bar-button"
        title="show-timeline"
        @click="toggleTimeline"
      >
        <i class="octicon octicon-clock"></i>
      </button>
    </div>
    <BibleChapterMap
      v-if="id && chapter && showMap"
      :id="id"
      :chapter="chapter"
    />
    <BibleChapterTimeline
      v-if="id && chapter && showTimeline"
      :id="id"
      :chapter="chapter"
    />
  </div>
</template>

<script>
import Wol from "@/lib/jw/Wol";
import $ from "jquery";
import langData from "@/lib/jw/languages/en-US";

export default {
  props: ["type"],
  data() {
    return {
      biblemap: undefined,
      controls: undefined,
      refStatus: undefined,
      mapLoaded: false,
      timelineLoaded: false,
      audioData: undefined,
      articleAudioOptions: undefined,
      id: new Date().getTime(),
      events: {},
      chapter: undefined, // the parent bible chapter
      article: undefined, // the parent article
      showMap: false,
      showTimeline: false,
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
    element() {
      return this.$el;
    },
    player() {
      return this.$refs.player ? this.$refs.player : undefined;
    },
    timelineElem() {
      return this.$refs.timeline ? this.$refs.timeline : undefined;
    },
  },

  methods: {
    toggleMaximizeAllRefs() {
      this.$emit("toggleMaximizeAllRefs");
    },
    togglePointForm() {
      this.$emit("togglePointForm");
    },
    randomLink() {
      this.$emit("randomLink");
    },
    hideRandomLines() {
      this.$emit("hideRandomLines");
    },
    verseNavPrev() {
      this.$emit("verseNavPrev");
    },
    verseNavNext() {
      this.$emit("verseNavNext");
    },
    toggleTimeline() {
      this.showTimeline = !this.showTimeline;
    },
    toggleMap() {
      this.showMap = !this.showMap;
    },
    loadRefs() {
      this.$emit("loadRefs");
    },
    refStatusClick() {
      this.$emit("refStatusClick");
    },
    toggleHideRandomParagraphs() {
      this.$emit("toggleHideRandomParagraphs");
    },

    async loadAudio() {
      var chapter = this.chapter;
      let audioData = await Wol.getBibleChapterAudio(
        chapter.chapter.pubMediaServer,
        chapter.chapter.audioSymbol,
        this.$l2.wol.mepsSymbol,
        chapter.bookId,
        chapter.chapterId,
        chapter
      );

      this.audioData = audioData;
      this.articleAudioOptions = {
        firstVerse: chapter.startVerse,
        lastVerse: chapter.endVerse,
        onMarker: function (verseNum, chapter) {
          let stopAtVerseNum = chapter.getNextVerseWith([
            "study-notes",
            "media",
          ]);
          if (stopAtVerseNum) {
            chapter.articleAudio.stopPlaybackAfterVerse(stopAtVerseNum);
          }
          // Highlight the verse being played
          chapter.highlightVerse(verseNum);
          if (Number(verseNum) !== Number(chapter.startVerse)) {
            chapter.scrollVerseIntoView(verseNum);
          }
        },
        onMarkerContext: chapter,
      };
    },

    async loadArticleAudio() {
      var article = this.article;
      if (article.article.docId) {
        let audioData = await Wol.getArticleAudio(
          article.article.pubMediaServer,
          article.article.audioSymbol,
          langData.jwLangSymbol,
          article.article.docId
        );
        this.audioData = audioData;
        this.articleAudioOptions = {
          firstParagraph: article.startParagraph,
          lastParagraph: article.endParagraph,
          onParagraphMarker: function (paragraphId, article) {
            if (article.currentParagraphId !== paragraphId) {
              article.currentParagraphId = paragraphId;
              // Highlight the paragraph
              article.highlightParagraph(article.currentParagraphId);
            }
          },
          onMarkerContext: article,
        };
      }
    },
  },
};
</script>

<style>
.jw-study-aid-audio-bar {
  padding-top: 2rem;
}

.jw-study-aid-audio-bar audio {
  margin: 0;
  width: 100%;
  border-radius: 0;
  height: 2rem;
}

.jw-study-aid-audio-bar.sticky {
  position: sticky;
  position: -webkit-sticky;
  z-index: 1;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  padding: 1rem;
  margin-left: -1rem;
  width: calc(100% + 2rem);
  background: white;
}

.jw-study-aid-citation-audio-bar.sticky {
  position: sticky;
  position: -webkit-sticky;
  display: flex;
  flex-wrap: nowrap;
  z-index: 1;
  background: #f6f6f6;
  line-height: 0;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
  padding: 1rem 0;
  margin-top: -1rem;
}

.jw-study-aid-citation-audio-bar audio {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  display: block;
}

/* large screens */
.jw-study-aid-audio-bar.sticky,
.jw-study-aid-citation-audio-bar.sticky {
  top: 0;
  /* menu */
  z-index: 2;
}

/* medium screen */
@media screen and (max-width: 768px) {
  .jw-study-aid-audio-bar.sticky {
    width: 100vw;
    padding: 1em calc((100vw - 100%) / 2);
    margin-left: calc((100vw - 100%) / -2);
  }

  .jw-study-aid-audio-bar.sticky,
  .jw-study-aid-citation-audio-bar.sticky {
    top: 0;
    /* no menu bar */
  }

  .admin-bar .jw-study-aid-audio-bar.sticky,
  .admin-bar .jw-study-aid-citation-audio-bar.sticky {
    top: 46px;
    /* admin bar */
  }
}

/* small screen */
@media screen and (max-width: 600px) {
  .jw-study-aid-audio-bar.sticky,
  .jw-study-aid-citation-audio-bar.sticky {
    top: 0;
    /* no menu bar */
  }

  .admin-bar .jw-study-aid-audio-bar.sticky,
  .admin-bar .jw-study-aid-citation-audio-bar.sticky {
    top: 0;
    /* admin bar */
  }
}

.verse-nav button {
  padding: 0;
  background: #444;
  border-radius: 0;
}

.verse-nav {
  display: flex;
  margin-left: auto;
}

.audio-bar-controls.hidden {
  display: none;
}

.audio-bar-controls {
  display: flex;
  justify-content: flex-end;
  background: #444444;
}

.media-bar-button {
  cursor: pointer;
  display: block;
  text-align: center;
  color: white;
  bottom: 0;
  line-height: 2rem;
}

.media-bar-button:hover {
  box-shadow: none !important;
  border-bottom: none !important;
  text-decoration: none !important;
  color: white !important;
}

.media-bar-button i {
  font-size: 1.2rem;
  position: relative;
  padding: 0 0.75rem;
}

.media-bar-button:hover {
  background: #767676;
}

@media (max-width: 30em) {
  .verse-nav-prev,
  .verse-nav-next {
    display: none;
  }
}
</style>