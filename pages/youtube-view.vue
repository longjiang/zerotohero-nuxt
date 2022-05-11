<router>
  {
    path: '/:l1/:l2/youtube/view/:youtube_id?/:lesson?',
    props: true,
    meta: {
      skin: 'dark',
      collapseNav: true
    },
  }
</router>
<template>
  <div
    :class="{
      'youtube-view pt-3 pb-5 ': true,
      'main-dark': true,
      'main-dark-performant': isMobile,
    }"
  >
    <SocialHead
      :title="`${video ? video.title + ' | ' : ''}Learn ${
        $l2.name
      } with a video | zerotohero.ca`"
      :description="`Study the transcript of this video with a popup dictionary`"
      :image="`https://img.youtube.com/vi/${this.youtube_id}/hqdefault.jpg`"
    />
    <div class="pl-3 pr-3 mb-4">
      <!-- <Sale class="mt-4 mb-4" v-if="$l2.code === 'zh'" /> -->
      <SimpleSearch
        placeholder="Search"
        ref="searchLibrary"
        skin="dark"
        :action="
          (url) => {
            this.$router.push({
              path: `/${$l1.code}/${
                $l2.code
              }/youtube/search/${encodeURIComponent(url)}`,
            });
          }
        "
      />
    </div>
    <div
      :class="{
        'youtube-view-wrapper': true,
        fullscreen: layout === 'vertical',
      }"
    >
      <div :class="{ 'loader text-center pt-5 pb-5': true, 'd-none': video }">
        <Loader :sticky="true" message="Preparing video and transcript..." />
      </div>
      <LazyYouTubeWithTranscript
        v-if="video"
        ref="youtube"
        skin="dark"
        :video="video"
        :quiz="$quiz"
        :key="`transcript-${video.youtube_id}`"
        :autoload="true"
        :autoplay="false"
        :starttime="starttime"
        :show="show"
        :showType="showType"
        :previousEpisode="previousEpisode"
        :nextEpisode="nextEpisode"
        :episodes="episodes"
        :episodeIndex="thisEpisodeIndex"
        :forcePortrait="false"
        :startLineIndex="startLineIndex"
        :initialLayout="layout"
        @paused="updatePaused"
        @ended="updateEnded"
        @currentTime="updateCurrentTime"
        @speechStart="speechStart"
        @speechEnd="speechEnd"
        @updateLayout="(l) => (layout = l)"
      />
    </div>
  </div>
</template>

<script>
import YouTube from "@/lib/youtube";
import Helper from "@/lib/helper";
import DateHelper from "@/lib/date-helper";
import Config from "@/lib/config";
import axios from "axios";
import Vue from "vue";

export default {
  props: {
    youtube_id: {
      type: String,
    },
    lesson: {
      default: false,
    },
  },
  data() {
    return {
      currentTime: 0,
      episodes: [],
      extrasLoaded: false,
      fetchDone: false,
      layout: "horizontal",
      mountedDone: false,
      paused: true,
      randomEpisodeYouTubeId: undefined,
      show: undefined,
      showType: undefined,
      startLineIndex: 0,
      starttime: 0,
      video: undefined,
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    $quiz() {
      if (typeof this.$store.state.settings.l2Settings !== "undefined")
        return this.$store.state.settings.l2Settings.showQuiz;
      else return false;
    },
    saved() {
      return this.video.id;
    },
    previousEpisode() {
      let thisEpisodeIndex = this.thisEpisodeIndex;
      if (thisEpisodeIndex > 0 && this.episodes[thisEpisodeIndex - 1])
        return `/${this.$l1.code}/${this.$l2.code}/youtube/view/${
          this.episodes[thisEpisodeIndex - 1].youtube_id
        }/`;
    },
    thisEpisodeIndex() {
      return this.episodes.findIndex((episode) => episode.youtube_id === this.video.youtube_id);
    },
    nextEpisode() {
      let thisEpisodeIndex = this.thisEpisodeIndex;
      if (this.episodes[thisEpisodeIndex + 1])
        return `/${this.$l1.code}/${this.$l2.code}/youtube/view/${
          this.episodes[thisEpisodeIndex + 1].youtube_id
        }/`;
    },
    currentTimeInSeconds() {
      let t = Math.floor(this.currentTime / 10) * 10;
      return t;
    },
    isMobile() {
      return Helper.isMobile();
    },
  },
  async fetch() {
    try {
      console.log(`YouTube View (Fetch): Getting saved video...`);
      let savedVideo, videoFromApi;
      savedVideo = await this.getSaved();
      if (this.lesson && savedVideo.level && savedVideo.lesson) {
        this.saveWords(savedVideo.level, savedVideo.lesson);
      }
      if (!savedVideo || (!savedVideo.channel && this.$adminMode)) {
        console.log(
          `YouTube View (Fetch): Getting channel information with youtube api...`
        );
        videoFromApi = await YouTube.videoByApi(this.youtube_id);
      }
      this.video = this.mergeVideos(savedVideo, videoFromApi);
    } catch (e) {
      console.log(e);
    }
  },
  destroyed() {
    this.unbindKeys();
  },
  watch: {
    async video() {
      if (!this.extrasLoaded && typeof this.video !== "undefined") {
        this.extrasLoaded = true;
        console.log(`YouTube View (on video change): load subs if missing...`);
        this.video = await this.loadSubsIfMissing(this.video);
        if (!Helper.wide()) {
          let el = this.$refs["youtube"];
          if (el) Helper.scrollToTargetAdjusted(el.$el, 43);
        }
        if (this.video && this.video.subs_l2 && this.video.subs_l2[0]) {
          if (!this.video.subs_l2[0].duration)
            this.video = await this.patchDuration(this.video);
          else
            console.log(
              "YouTube View: Video subs have duration! 🎉 First line duration is ",
              this.video.subs_l2[0].duration
            );
        }
        console.log(`YouTube View (on video change): loading extras...`);
        await this.loadExtras();
        this.bindKeys();
        this.unsubscribe = this.$store.subscribe((mutation, state) => {
          if (mutation.type === "shows/LOAD_SHOWS") {
            this.loadShow();
          }
        });
        this.saveHistory();
      }
    },
    async show() {
      if (this.show) {
        // News and YouTube channels are sorted by date
        // Audiobooks and TV Shows are sorted by title
        let sort = "-date"
        if (this.showType === "tv_show" || this.show.audiobook) sort = "title"
        let response = await axios.get(
          `${Config.youtubeVideosTableName(this.$l2.id)}?filter[l2][eq]=${
            this.$l2.id
          }&filter[${this.showType}][eq]=${
            this.show.id
          }&sort=${sort}&fields=youtube_id&timestamp=${
            this.$adminMode ? Date.now() : 0
          }&limit=100`
        );
        if (response.data && response.data.data) {
          let videos = response.data.data;
          videos = Helper.uniqueByValue(videos, "youtube_id");
          this.episodes = videos;
        }
      }
    },
  },
  methods: {
    mergeVideos(video, youtube_video) {
      let merged = {};
      video = video || {};
      youtube_video = youtube_video || {};
      for (var attrname in video) {
        merged[attrname] = video[attrname] || youtube_video[attrname];
      }
      for (var attrname in youtube_video) {
        merged[attrname] = video[attrname] || youtube_video[attrname];
      }
      return merged;
    },
    async checkSubsAndAddLocalesIfNeeded(video) {
      try {
        let missingSubsL1 = !video.subs_l1 || video.subs_l1.length === 0;
        let missingSubsL2 = !video.subs_l2 || video.subs_l2.length === 0;
        if (missingSubsL1 || missingSubsL2) {
          console.log(`YouTube View: Getting available transcripts...`);
          video = await YouTube.getYouTubeSubsListAndAddLocale(
            video,
            this.$l1,
            this.$l2
          );
        } else {
          Vue.set(video, "checkingSubs", false);
        }
        return video;
      } catch (err) {
        console.log(err);
      }
    },
    async getTranscript(video) {
      console.log(`YouTube View: Getting ${this.$l2.name} transcript`);
      Vue.set(video, "checkingSubs", true);
      console.log();
      let subs_l2 = await YouTube.getTranscript(
        video.youtube_id,
        video.l2Locale,
        video.l2Name,
        this.$adminMode
      );
      if (subs_l2 && subs_l2.length > 0) Vue.set(video, "subs_l2", subs_l2);
      Vue.set(video, "checkingSubs", false);
      return video;
    },
    async loadSubsIfMissing(video) {
      try {
        video = await this.checkSubsAndAddLocalesIfNeeded(video);
        if (!video.subs_l2 || video.subs_l2.length === 0) {
          video = await this.getTranscript(video);
        }
        if (video.subs_l2 && video.subs_l2.length > 0) {
          this.firstLineTime = video.subs_l2[0].starttime;
        }
        this.starttime = this.$route.query.t ? Number(this.$route.query.t) : 0;
        if (video.subs_l2) {
          let startLineIndex = video.subs_l2.findIndex(
            (l) => Number(l.starttime) >= this.starttime
          );
          this.startLineIndex = startLineIndex || 0;
        }
        return video;
      } catch (err) {
        console.log(err);
      }
      return video;
    },
    async loadExtras() {
      console.log(`YouTube View: Loading show...`);
      this.loadShow();
      console.log(`YouTube View: Saving history...`);
      this.saveHistory();
      console.log(`YouTube View: All done.`);
    },
    async getSaved() {
      let response = await axios.get(
        `${Config.youtubeVideosTableName(this.$l2.id)}?filter[youtube_id][eq]=${
          this.youtube_id
        }&filter[l2][eq]=${this.$l2.id}&fields=*,tv_show.*,talk.*&timestamp=${
          this.$adminMode ? Date.now() : 0
        }`
      );
      response = response.data;

      if (response && response.data && response.data.length > 0) {
        let video = response.data[0];
        for (let field of ["subs_l2", "subs_l1"]) {
          if (video[field] && typeof video[field] === "string") {
            let savedSubs = YouTube.parseSavedSubs(video[field]);
            if (savedSubs) {
              let filtered = savedSubs.filter(
                (line) =>
                  line && typeof line.starttime !== "undefined" && line.line
              );
              video[field] = filtered;
            }
          }
        }
        if (video.notes) video.notes = YouTube.parseNotes(video.notes);
        if (!video.channel && video.channel_id) {
          video.channel = {
            id: video.channel_id,
          };
        }
        video.checkingSubs = false;
        return video;
      }
    },
    loadShow() {
      if (this.video) {
        if (this.video.tv_show) {
          this.show = this.video.tv_show;
          this.showType = "tv_show";
        } else if (this.video.talk) {
          this.show = this.video.talk;
          this.showType = "talk";
        }
      }
    },
    updateCurrentTime(currentTime) {
      if (typeof window !== "undefined") {
        this.currentTime = currentTime;
        const params = new URLSearchParams(window.location.search);
        const qt = params.get("t") ? Number(params.get("t")) : 0;
        if (this.currentTimeInSeconds !== qt) {
          window.history.replaceState(
            "",
            "",
            `?t=${this.currentTimeInSeconds}`
          );
          this.saveHistory();
        }
      }
    },
    speechStart() {
      this.speaking = true;
    },
    speechEnd() {
      this.speaking = false;
    },
    updatePaused(paused) {
      if (paused !== this.paused) {
        this.paused = paused;
      }
    },
    async updateEnded(ended) {
      if (ended !== this.ended) {
        this.ended = ended;
      }
      if (this.ended) {
        await Helper.timeout(5000);
        if (
          this.ended &&
          this.$refs.youtube &&
          !this.$refs.youtube.showSubsEditing &&
          !this.$refs.youtube.enableTranslationEditing
        ) {
          if (this.nextEpisode) this.$router.push(this.nextEpisode);
        }
      }
    },
    wordSaved(word) {
      let saved = false;
      if (word) {
        saved = this.$store.getters["savedWords/has"]({
          id: word.id,
          l2: this.$l2.code,
        });
      }
      return saved;
    },
    async allForms(word) {
      let wordForms =
        (await (await this.$getDictionary()).wordForms(word)) || [];
      wordForms = wordForms.filter((form) => form !== "");
      wordForms = [word.bare.toLowerCase()].concat(
        wordForms.map((form) => form.form.replace(/'/g, ""))
      );
      wordForms = Helper.unique(wordForms).filter(
        (form) => form && form !== "" && form !== "-"
      );
      return wordForms;
    },
    async saveWords(level, lesson) {
      let dictionary = await this.$getDictionary();
      if (typeof dictionary !== "undefined") {
        let words = await dictionary.lookupByLesson(level, lesson);
        for (let word of words) {
          if (word && !this.wordSaved(word)) {
            let wordForms = await this.allForms(word);
            this.$store.dispatch("savedWords/add", {
              word: word,
              wordForms: wordForms,
              l2: this.$l2.code,
            });
          }
        }
      }
    },
    async patchChannelID(video, channelId) {
      let response = await axios.patch(
        `${Config.youtubeVideosTableName(this.$l2.id)}/${
          video.id
        }?fields=id,channel_id`,
        { channel_id: channelId }
      );
      if (response && response.data) {
        video.channel_id = response.data;
      }
    },
    async patchDuration(video) {
      console.log(
        "YouTube View: Saved subtitles does not have duration, getting duration..."
      );
      video = await this.checkSubsAndAddLocalesIfNeeded(video);
      video = await this.getTranscript(video);
      if (video.subs_l2 && video.subs_l2[0] && video.subs_l2[0].duration) {
        let subs_l2 = YouTube.unparseSubs(video.subs_l2);
        try {
          await axios.patch(
            `${Config.youtubeVideosTableName(this.$l2.id)}/${
              video.id
            }?fields=id`,
            { subs_l2 }
          );
          console.log("Missing duration information added.");
        } catch (err) {
          console.log(err);
        }
      }
      return video;
    },
    scrollToComments() {
      document.getElementById("comments").scrollIntoView();
    },
    togglePaused() {
      this.$refs.youtube.togglePaused();
    },
    bindKeys() {
      window.onkeydown = (e) => {
        if (
          e.target.tagName.toUpperCase() !== "INPUT" &&
          !e.metaKey &&
          !e.target.getAttribute("contenteditable")
        ) {
          if (e.code === "KeyM") {
            if (this.$refs.youtube && this.$refs.youtube.$refs.videoControls)
              this.$refs.youtube.$refs.videoControls.toggleSpeed();
            return false;
          }
          if (e.code === "Space") {
            this.togglePaused();
            return false;
          }
          if (["ArrowUp", "ArrowLeft"].includes(e.code)) {
            this.$refs.youtube.$refs.transcript.goToPreviousLine();
            return false;
          }
          if (["ArrowDown", "ArrowRight"].includes(e.code)) {
            this.$refs.youtube.$refs.transcript.goToNextLine();
            return false;
          }
          if (["KeyR"].includes(e.code)) {
            this.$refs.youtube.$refs.transcript.rewind();
            return false;
          }
        }
      };
    },
    saveHistory() {
      if (typeof this.video === "undefined") return;
      let data = {
        type: "video",
        id: `${this.$l2.code}-video-${this.video.youtube_id}`,
        date: DateHelper.unparseDate(new Date()),
        l1: this.$l1.code,
        l2: this.$l2.code,
        video: {
          id: this.video.id,
          title: this.video.title,
          youtube_id: this.video.youtube_id,
          starttime: this.currentTimeInSeconds,
        },
      };
      if (this.$refs.youtube && this.$refs.youtube.duration) {
        data.video.duration = this.$refs.youtube.duration;
        data.video.progress = data.video.starttime / data.video.duration;
      }
      this.$store.dispatch("history/add", data);
    },
    unbindKeys() {
      window.onkeydown = null;
    },
  },
  activated() {
    this.bindKeys();
  },
  deactivated() {
    this.unbindKeys();
  },
};
</script>
<style lang="scss" scoped >
.zerotohero-wide {
  .youtube-view-wrapper {
    ::v-deep .youtube-with-transcript-landscape {
      .youtube {
        border-radius: 0.3rem 0.3rem 0 0;
        overflow: hidden;

        .video-area {
          background: black;
        }
      }

      .quick-access-buttons {
        border-radius: 0 0 0.3rem 0.3rem;
      }
    }
  }
}

.youtube-view-wrapper {
  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: black;
    color: #ffffffaa;
    z-index: 9;
  }
}
</style>
