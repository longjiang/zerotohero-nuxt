<router>
  {
    path: '/:l1/:l2/youtube/view/:youtube_id?/:lesson?',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <container-query :query="query" v-model="params">
    <div
      :class="{
        'youtube-view pt-3 pb-5 ': true,
        'main-dark': layout !== 'vertical',
        'main-dark-performant': isMobile,
      }"
    >
      <SocialHead
        v-if="video"
        :title="`Learn ${$l2.name} from the video ${video.title} | ${$l2.name} Zero to Hero`"
        :description="`Watch the video -- ${
          video.title
        } -- study the subtitles and improve your ${$l2.name}! ${
          this.video.subs_l2 && this.video.subs_l2.length > 0
            ? 'Full transcript: ' +
              this.video.subs_l2
                .slice(0, 10)
                .filter((l) => l)
                .map((l) => l.line)
                .join(' ')
            : ''
        }`"
        :image="`https://img.youtube.com/vi/${this.video.youtube_id}/hqdefault.jpg`"
      />
      <div class="pl-3 pr-3 mb-4">
        <SimpleSearch
          placeholder="Search"
          ref="searchLibrary"
          :random="
            randomEpisodeYouTubeId
              ? `/${$l1.code}/${$l2.code}/youtube/view/${randomEpisodeYouTubeId}`
              : false
          "
          skin="dark"
          :action="
            (url) => {
              this.$router.push({
                path: `/${$l1.code}/${
                  $l2.code
                }/youtube/browse/all/all/0/${encodeURIComponent(url)}`,
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
          <Loader :sticky="true" message="Preparing video and subtitles..." />
        </div>
        <LazyYouTubeWithTranscript
          v-if="video"
          ref="youtube"
          skin="dark"
          :video="video"
          :quiz="$quiz"
          :key="`transcript-${video.youtube_id}`"
          :autoload="true"
          :autoplay="true"
          :starttime="starttime"
          :show="show"
          :showType="showType"
          :previousEpisode="previousEpisode"
          :nextEpisode="nextEpisode"
          :episodes="episodes"
          :episodeIndex="thisEpisodeIndex"
          :forcePortrait="params.narrow"
          :startLineIndex="startLineIndex"
          @paused="updatePaused"
          @ended="updateEnded"
          @currentTime="updateCurrentTime"
          @speechStart="speechStart"
          @speechEnd="speechEnd"
          @updateLayout="(l) => (layout = l)"
        />
      </div>
    </div>
  </container-query>
</template>

<script>
import YouTube from "@/lib/youtube";
import Helper from "@/lib/helper";
import DateHelper from "@/lib/date-helper";
import Config from "@/lib/config";
import axios from "axios";
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ContainerQuery,
  },
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
      video: undefined,
      show: undefined,
      showType: undefined,
      paused: true,
      starttime: 0,
      startLineIndex: 0,
      currentTime: 0,
      episodes: [],
      randomEpisodeYouTubeId: undefined,
      layout: "horizontal",
      params: {},
      query: {
        narrow: {
          maxWidth: 900,
        },
      },
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
      return this.episodes.findIndex((episode) => episode.id === this.video.id);
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
      return Helper.isMobile()
    }
  },
  async fetch() {
    try {
      console.log(`YouTube View: Getting saved video...`);
      let video = await this.getSaved();
      if (this.lesson && video.level && video.lesson) {
        this.saveWords(video.level, video.lesson);
      }
      if (!video || !video.channel) {
        console.log(
          `YouTube View: Getting channel information with youtube api...`
        );
        let youtube_video = await YouTube.videoByApi(this.youtube_id);
        if (youtube_video) {
          if (!video) video = {};
          let merged = {};
          for (var attrname in video) {
            merged[attrname] = video[attrname] || youtube_video[attrname];
          }
          for (var attrname in youtube_video) {
            merged[attrname] = video[attrname] || youtube_video[attrname];
          }
          video = merged;
        }
      }
      if (!video.subs_l2 || video.subs_l2.length === 0) {
        console.log(`YouTube View: Getting ${this.$l2.name} transcript`);
        video.subs_l2 = await this.getTranscriptByLang(this.$l2);
      }
      if (!video.subs_l1 || video.subs_l1.length === 0) {
        console.log(`YouTube View: Getting ${this.$l1.name} transcript`);
        video.subs_l1 = await this.getTranscriptByLang(this.$l1);
      }

      if (video.subs_l2 && video.subs_l2.length > 0) {
        this.firstLineTime = video.subs_l2[0].starttime;
      }
      if (video && video.id && !video.channel_id) {
        console.log(`YouTube View: Adding channel id...`);
        this.addChannelID(video);
      }
      this.starttime = this.$route.query.t ? Number(this.$route.query.t) : 0;
      this.startLineIndex = video.subs_l2.findIndex(l => Number(l.starttime) > this.starttime) || 0
      this.video = video;
      console.log(`YouTube View: this.video assigned.`);
      console.log(`YouTube View: Loading show...`);
      this.loadShow();
      console.log(`YouTube View: Getting random episode youtube_id...`);
      this.randomEpisodeYouTubeId = await YouTube.getRandomEpisodeYouTubeId(
        this.$l2.id,
        this.$store.state.shows.tvShows[this.$l2.code] ? "tv_show" : undefined
      );
      console.log(
        `YouTube View: Got random episode youtube_id ${this.randomEpisodeYouTubeId}`
      );
      console.log(`YouTube View: Saving history...`);
      this.saveHistory();
      console.log(`YouTube View: All done.`);
    } catch (e) {
      console.log(e);
    }
  },
  mounted() {
    this.bindKeys();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "shows/LOAD_SHOWS") {
        this.loadShow();
      }
    });
    if (this.video) {
      this.saveHistory();
    }
  },
  destroyed() {
    this.unbindKeys();
  },
  watch: {
    async show() {
      if (this.show) {
        let sort = this.show.title !== "News" ? "title" : "-date";
        let response = await axios.get(
          `${Config.wiki}items/youtube_videos?filter[l2][eq]=${
            this.$l2.id
          }&filter[${this.showType}][eq]=${
            this.show.id
          }&sort=${sort}&fields=channel_id,id,lesson,level,title,date,topic,youtube_id,tv_show.*,talk.*&timestamp=${
            this.$adminMode ? Date.now() : 0
          }&limit=500`
        );
        if (response.data && response.data.data) {
          let videos = response.data.data;
          videos = Helper.uniqueByValue(videos, "youtube_id");
          if (this.show.title !== "News") {
            videos =
              videos.sort((x, y) =>
                x.title.localeCompare(y.title, this.$l2.code, { numeric: true })
              ) || [];
          } else {
            videos =
              videos.sort((y, x) =>
                x.date
                  ? x.date.localeCompare(y.date, this.$l2.code, {
                      numeric: true,
                    })
                  : -1
              ) || [];
          }
          this.episodes = videos;
        }
      }
    },
  },
  methods: {
    async getSaved() {
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?filter[youtube_id][eq]=${
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
          this.$router.push(
            this.nextEpisode ||
              `/${this.$l1.code}/${this.$l2.code}/youtube/view/${this.randomEpisodeYouTubeId}`
          );
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
      let words = await (
        await this.$getDictionary()
      ).lookupByLesson(level, lesson);
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
    },
    async getTranscriptByLang(lang) {
      let locales = [lang.code];
      if (lang.locales) {
        locales = locales.concat(lang.locales);
      }
      return await YouTube.getTranscriptByLocales(this.youtube_id, locales);
    },
    async addChannelID(video) {
      if (video.channel && video.channel.id) {
        let channelId = video.channel.id;
        let response = await axios.patch(
          `${Config.wiki}items/youtube_videos/${video.id}`,
          { channel_id: channelId }
        );
        if (response && response.data) {
          video = response.data;
        }
      }
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
      padding-left: 2rem;
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
}
</style>
