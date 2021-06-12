<router>
  {
    path: '/:l1/:l2/youtube/view/:youtube_id?/:lesson?',
    props: true,
  }
</router>
<template>
  <div class="youtube-view pt-3 pb-5">
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
              .map((l) => l.line)
              .join(' ')
          : ''
      }`"
      :image="`https://img.youtube.com/vi/${this.video.youtube_id}/hqdefault.jpg`"
    />
    <div class="pl-3 pr-3 mb-5">
      <SimpleSearch
        placeholder="Search"
        ref="searchLibrary"
        :random="`/${$l1.code}/${$l2.code}/youtube/view/${randomEpisodeYouTubeId}`"
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
        'youtube-view-wrapper main': true,
        fullscreen: layout === 'vertical',
      }"
    >
      <div :class="{ 'loader text-center pt-5 pb-5': true, 'd-none': video }">
        <div class="heartbeat-loader"></div>
      </div>
      <YouTubeWithTranscript
        v-if="video"
        :video="video"
        :layout="layout"
        ref="youtube"
        :quiz="$quiz"
        :key="`transcript-${video.youtube_id}`"
        :speed="speed"
        :autoload="true"
        :autoplay="true"
        :starttime="starttime"
        :show="show"
        :previousEpisode="previousEpisode"
        :nextEpisode="nextEpisode"
        @paused="updatePaused"
        @ended="updateEnded"
        @currentTime="updateCurrentTime"
        @speechStart="speechStart"
        @speechEnd="speechEnd"
      />
      <div
        v-if="video"
        :class="{ 'youtube-view-line-list': true, 'd-none': !showList }"
      >
        <b-input-group class="youtube-view-line-list-filter-wrapper">
          <b-form-input
            v-model.lazy="filterList"
            placeholder="Filter"
          ></b-form-input>
          <b-input-group-append>
            <b-input-group-text v-if="!filterList" class="btn btn-primary">
              <i class="fas fa-filter"></i>
            </b-input-group-text>
            <b-input-group-text
              v-if="filterList"
              class="btn btn-primary"
              @click="filterList = ''"
            >
              <i class="fas fa-times"></i>
            </b-input-group-text>
          </b-input-group-append>
        </b-input-group>
        <div
          v-for="(line, index) in sortedLines"
          :class="{
            'youtube-view-line-list-item': true,
            active:
              $refs.youtube &&
              $refs.youtube.$refs.transcript &&
              $refs.youtube.$refs.transcript.currentLine === line,
          }"
          :key="`video-line-list-${index}`"
          @click="
            $refs.youtube.goToLine(line);
            showList = !showList;
          "
        >
          {{ line.line }}
        </div>
      </div>
      <div v-if="video" class="quick-access-buttons">
        <button
          :class="{
            'quick-access-button shadow btn-secondary d-inline-block text-center': true,
            'btn-primary': showList,
          }"
          @click="showList = !showList"
        >
          <i class="fas fa-align-left"></i>
        </button>
        <button
          :class="{
            'quick-access-button shadow btn-secondary d-inline-block text-center': true,
            'btn-primary': speed !== 1,
          }"
          @click="speed = speed === 1 ? 0.75 : speed === 0.75 ? 0.5 : 1"
        >
          <i v-if="speed === 1" class="fas fa-tachometer-alt"></i>
          <span
            v-else
            style="font-size: 0.6em; display: block; line-height: 2.5em"
          >
            {{ speed }}x
          </span>
        </button>
        <button
          class="quick-access-button shadow btn-secondary d-inline-block text-center"
          @click="$refs.youtube.$refs.transcript.goToPreviousLine()"
        >
          <i class="fas fa-arrow-up"></i>
        </button>
        <button
          :class="{
            'quick-access-button play-pause shadow d-inline-block text-center btn-primary': true,
          }"
          @click="togglePaused"
        >
          <i v-if="paused && !speaking" class="fas fa-play"></i>
          <i v-if="!paused || speaking" class="fas fa-pause"></i>
        </button>
        <button
          class="quick-access-button shadow btn-secondary d-inline-block text-center"
          @click="$refs.youtube.$refs.transcript.goToNextLine()"
        >
          <i class="fas fa-arrow-down"></i>
        </button>
        <button
          :class="{
            'quick-access-button shadow btn-secondary d-inline-block text-center': true,
            'btn-primary': repeatMode,
          }"
          @click="repeatMode = !repeatMode"
        >
          <i class="fas fa-undo"></i>
        </button>
        <button
          :class="{
            'quick-access-button shadow btn-secondary d-inline-block text-center': true,
            'btn-primary': audioMode,
          }"
          @click="audioMode = !audioMode"
        >
          <i class="fas fa-headphones"></i>
        </button>
        <button
          :class="{
            'quick-access-button shadow btn-secondary d-inline-block text-center': true,
            'btn-primary': layout === 'vertical',
          }"
          @click="layout = layout === 'horizontal' ? 'vertical' : 'horizontal'"
        >
          <i class="fas fa-expand"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import YouTubeWithTranscript from "@/components/YouTubeWithTranscript";
import SimpleSearch from "@/components/SimpleSearch";
import YouTubeSearchResults from "@/components/YouTubeSearchResults";
import YouTube from "@/lib/youtube";
import Helper from "@/lib/helper";
import Config from "@/lib/config";
import axios from "axios";

export default {
  components: {
    YouTubeSearchResults,
    SimpleSearch,
    YouTubeWithTranscript,
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
      showList: false,
      show: undefined,
      speaking: false,
      paused: true,
      speed: 1,
      starttime: 0,
      currentTime: 0,
      episodes: [],
      filterList: "",
      layout: "horizontal",
      repeatMode: false,
      audioMode: false,
      randomEpisodeYouTubeId: undefined,
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
      else return false
    },
    saved() {
      return this.video.id;
    },
    sortedLines() {
      if (this.video && this.video.subs_l2) {
        let lines = this.video.subs_l2
          .map((line) => line)
          .filter((line) => new RegExp(this.filterList, "gi").test(line.line));

        for (let line of lines) {
          line.count = lines.filter((l) => l.line === line.line).length;
        }
        let sortedLines = lines
          .sort((a, b) => a.line.localeCompare(b.line, this.$l2.code))
          .sort((a, b) => a.line.length - b.line.length)
          .sort((a, b) => b.count - a.count);
        return sortedLines;
      }
    },
    previousEpisode() {
      let thisEpisodeIndex = this.episodes.findIndex(
        (episode) => episode.id === this.video.id
      );
      if (thisEpisodeIndex > 0 && this.episodes[thisEpisodeIndex - 1])
        return `/${this.$l1.code}/${this.$l2.code}/youtube/view/${
          this.episodes[thisEpisodeIndex - 1].youtube_id
        }/`;
    },
    nextEpisode() {
      let thisEpisodeIndex = this.episodes.findIndex(
        (episode) => episode.id === this.video.id
      );
      if (this.episodes[thisEpisodeIndex + 1])
        return `/${this.$l1.code}/${this.$l2.code}/youtube/view/${
          this.episodes[thisEpisodeIndex + 1].youtube_id
        }/`;
    },
  },
  async fetch() {
    let video = await this.getSaved();
    if (this.lesson && video.level && video.lesson) {
      this.saveWords(video.level, video.lesson);
    }
    if (!video || !video.channel) {
      let youtube_video = await YouTube.videoByApi(this.youtube_id);
      if (youtube_video) video = Object.assign(youtube_video, video || {});
    }
    video.subs_l2 = await this.getL2TranscriptIfNeeded(video);
    video.subs_l1 = await this.getTranscriptByLang(this.$l1);

    if (video.subs_l2 && video.subs_l2.length > 0) {
      this.firstLineTime = video.subs_l2[0].starttime;
    }
    if (video && video.id && !video.channel_id) {
      this.addChannelID(video);
    }
    this.starttime = this.$route.query.t ? Number(this.$route.query.t) : 0;
    this.video = video;
    this.loadShow();
    this.randomEpisodeYouTubeId = await YouTube.getRandomEpisodeYouTubeId(
      this.$l2.code,
      this.$l2.id
    );
    this.saveHistory();
  },
  mounted() {
    this.bindKeys();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "tvShows/LOAD_TV_SHOWS") {
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
  updated() {
    this.$refs.youtube.repeatMode = this.repeatMode;
    this.$refs.youtube.audioMode = this.audioMode;
    this.$refs.youtube.speed = this.speed;
  },
  watch: {
    repeatMode() {
      this.$refs.youtube.repeatMode = this.repeatMode;
    },
    audioMode() {
      this.$refs.youtube.audioMode = this.audioMode;
    },
    async show() {
      if (this.show) {
        let filters = "";

        filters +=
          "&filter[title][contains]=" +
          encodeURIComponent(this.show.title) +
          "&sort=title";

        let response = await axios.get(
          `${Config.wiki}items/youtube_videos?sort=-id&filter[l2][eq]=${
            this.$l2.id
          }${filters}&offset=${
            this.start
          }&fields=channel_id,id,lesson,level,title,topic,youtube_id${
            this.$adminMode ? ",subs_l2" : ""
          }&timestamp=${this.$adminMode ? Date.now() : 0}`
        );

        if (response.data && response.data.data) {
          this.episodes = Helper.uniqueByValue(
            response.data.data,
            "youtube_id"
          );
        }
      }
    },
  },
  methods: {
    loadShow() {
      if (this.video) {
        this.show = this.$store.state.tvShows.shows[this.$l2.code]
          ? this.$store.state.tvShows.shows[this.$l2.code].find((show) =>
              this.video.title.includes(show.title)
            )
          : undefined;
      }
    },
    updateCurrentTime(currentTime) {
      if (typeof window !== "undefined") {
        this.currentTime = currentTime;
        let t = Math.floor(currentTime / 10) * 10;
        const params = new URLSearchParams(window.location.search);
        const qt = params.get("t") ? Number(params.get("t")) : 0;
        if (t !== qt) {
          window.history.replaceState("", "", `?t=${t}`);
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
    updateEnded(ended) {
      if (ended !== this.ended) {
        this.ended = ended;
      }
      if (this.ended) {
        setTimeout(() => {
          if (this.ended) {
            this.$router.push(
              this.nextEpisode ||
                `/${this.$l1.code}/${this.$l2.code}/youtube/view/${this.randomEpisodeYouTubeId}`
            );
          }
        }, 5000);
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
      let words = await (await this.$getDictionary()).lookupByLesson(
        level,
        lesson
      );
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
    async getL2TranscriptIfNeeded(video) {
      if (video.subs_l2 && Array.isArray(video.subs_l2)) {
        return video.subs_l2;
      }
      if (video.subs_l2 && typeof video.subs_l2 === "string") {
        let savedSubs = JSON.parse(video.subs_l2);

        if (savedSubs) {
          let filtered = savedSubs.filter(
            (line) => line && line.starttime && line.line
          );
          return filtered;
        }
      }
      if (!video.subs_l2 || video.subs_l2.length === 0) {
        return await this.getTranscriptByLang(this.$l2);
      }
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
    async getSaved() {
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?filter[youtube_id][eq]=${
          this.youtube_id
        }&filter[l2][eq]=${
          this.$l2.id
        }&fields=id,youtube_id,channel_id,l2,title,level,topic,lesson,subs_l2&timestamp=${
          this.$adminMode ? Date.now() : 0
        }`
      );
      response = response.data;
      if (response && response.data && response.data.length > 0) {
        return response.data[0];
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
            this.speed =
              this.speed === 1 ? 0.75 : this.speed === 0.75 ? 0.5 : 1;
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
      this.$store.dispatch("history/add", {
        path: this.$route.fullPath,
        title: this.video.title,
        image: `https://img.youtube.com/vi/${this.video.youtube_id}/hqdefault.jpg`,
        l2: this.$l2.code,
      });
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
<style scoped>
.quick-access-buttons {
  position: sticky;
  bottom: 2rem;
  margin-top: 5rem;
  margin-bottom: 4rem;
  text-align: center;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-access-button.play-pause {
  width: 3.7rem;
  height: 3.7rem;
}

.quick-access-button {
  border-radius: 100%;
  width: 2.5rem;
  height: 2.5rem;
  line-height: 2.5rem;
  border: none;
  cursor: pointer;
  text-align: center;
  margin: 0 0.2rem;
  padding: 0;
}

.youtube-view-wrapper.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  z-index: 9;
}
.youtube-view-wrapper.fullscreen .quick-access-buttons {
  position: fixed;
  width: 100%;
  margin-bottom: 0;
  bottom: 2rem;
}

@media (orientation: landscape) {
  .youtube-view-wrapper.fullscreen .quick-access-buttons {
    bottom: 0.8rem;
  }
}

.youtube-view-line-list {
  position: fixed;
  width: 20rem;
  max-height: calc(100vh - 15rem);
  overflow: scroll;
  border-radius: 0.3rem;
  background: white;
  z-index: 10;
  left: calc(50vw - 10rem);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  bottom: 6rem;
}

.youtube-view-line-list .youtube-view-line-list-item {
  padding: 0.2rem 0.7rem;
}

.youtube-view-line-list-item {
  cursor: pointer;
}

.youtube-view-line-list-item.active {
  background-color: #eee;
}

.youtube-view-line-list-filter-wrapper {
  padding: 0.25rem;
  background: white;
  width: calc(100% - 0.5rem);
  position: sticky;
  top: 0;
}
</style>
