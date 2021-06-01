<router>
  {
    path: '/:l1/:l2/youtube/view/:args?/:lesson?',
    props: true,
  }
</router>
<template>
  <div class="youtube-view main pt-3 pb-5">
    <SocialHead
      v-if="video"
      :title="`Learn ${$l2.name} from the video ${video.title} | ${$l2.name} Zero to Hero`"
      :description="`Watch the video -- ${
        video.title
      } -- study the subtitles and improve your ${$l2.name}! ${
        this.video.subs_l2
          ? 'Full transcript: ' +
            this.video.subs_l2
              .slice(0, 10)
              .map((l) => l.line)
              .join(' ')
          : ''
      }`"
      :image="`https://img.youtube.com/vi/${this.video.youtube_id}/hqdefault.jpg`"
    />
    <SimpleSearch
      class="mb-3 pl-3 pr-3"
      placeholder="Search"
      ref="searchLibrary"
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
    <div
      :class="{
        'youtube-view-wrapper': true,
        fullscreen: layout === 'vertical',
      }"
    >
      <YouTubeWithTranscript
        v-if="video"
        :video="video"
        :layout="layout"
        ref="youtube"
        :quiz="true"
        :key="`transcript-${video.youtube_id}`"
        :speed="speed"
        :autoload="true"
        :autoplay="true"
        @paused="updatePaused"
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
          v-for="(line, index) in video.subs_l2
            .map((line) => line)
            .sort((a, b) => a.line.localeCompare(b.line, $l2.code))
            .sort((a, b) => a.line.length - b.line.length)
            .filter((line) => new RegExp(filterList, 'gi').test(line.line))"
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
      <div class="quick-access-buttons">
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
          class="quick-access-button play-pause shadow btn-primary d-inline-block text-center"
          @click="togglePaused"
        >
          <i v-if="paused" class="fas fa-play"></i>
          <i v-else class="fas fa-pause"></i>
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
            'btn-primary': repeat,
          }"
          @click="repeat = !repeat"
        >
          <i class="fas fa-undo"></i>
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
import parser from "fast-xml-parser";
import { parse } from "node-html-parser";

export default {
  components: {
    YouTubeSearchResults,
    SimpleSearch,
    YouTubeWithTranscript,
  },
  props: {
    args: {
      type: String,
    },
    lesson: {
      default: false,
    },
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
    saved() {
      return this.video.id;
    },
  },
  data() {
    return {
      l2Locale: undefined,
      video: undefined,
      showList: false,
      paused: true,
      speed: 1,
      filterList: "",
      layout: "horizontal",
      repeat: false,
    };
  },
  mounted() {
    this.bindKeys();
  },
  destroyed() {
    this.unbindKeys();
  },
  watch: {
    repeat() {
      this.$refs.youtube.repeat = this.repeat;
    },
  },
  async fetch() {
    // this.$refs.search.url = `https://www.youtube.com/watch?v=${this.args}`
    let video = await this.getSaved();
    if (this.lesson && video.level && video.lesson) {
      this.saveWords(video.level, video.lesson);
    }
    if (!video || !video.channel) {
      let youtube_video = await YouTube.videoByApi(this.args);
      if (youtube_video) video = Object.assign(video || {}, youtube_video);
    }
    video.subs_l2 = await this.getTranscript(video);

    if (video.subs_l2 && video.subs_l2.length > 0) {
      this.firstLineTime = video.subs_l2[0].starttime;
    }
    if (video && video.id && !video.channel_id) {
      this.addChannelID(video);
    }
    this.video = video;
  },
  methods: {
    updatePaused(paused) {
      if (paused !== this.paused) {
        this.paused = paused;
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
    async getL2Transcript() {
      let locales = [this.$l2.code];
      if (this.$l2.locales) {
        locales = locales.concat(this.$l2.locales);
      }

      let xml = await Helper.proxy(
        `https://www.youtube.com/api/timedtext?v=${this.args}&type=list`
      );
      let root = parser.parse(xml, {
        ignoreAttributes: false,
      });
      if (
        typeof root.transcript_list !== "undefined" &&
        typeof root.transcript_list.track !== "undefined"
      ) {
        let tracks =
          root.transcript_list.track.length > 0
            ? root.transcript_list.track
            : [root.transcript_list.track];
        for (let track of tracks) {
          let locale = track["@_lang_code"];
          if (locales.includes(locale)) {
            this.l2Locale = locale;
          }
        }
        if (this.l2Locale) {
          let html = await Helper.proxy(
            `https://www.youtube.com/api/timedtext?v=${this.args}&lang=${this.l2Locale}&fmt=srv3`
          );

          let lines = [];
          let root = parse(html);
          for (let p of root.querySelectorAll("p")) {
            let line = {
              line: p.innerText,
              starttime: parseInt(p.getAttribute("t")) / 1000,
            };
            lines.push(line);
          }
          return lines.filter((line) => line.line.trim() !== "");
        }
      }
    },
    async getL1Transcript() {
      await Helper.scrape(
        `https://www.youtube.com/api/timedtext?v=${this.args}&lang=${this.l2Locale}&fmt=srv3&tlang=${this.$l1.code}`,
        ($html) => {
          for (let p of $html.find("p")) {
            let line = {
              line: $(p).text(),
              starttime: parseInt($(p).attr("t")) / 1000,
            };
            this.l1Lines.push(line);
          }
        }
      );
    },
    async getTranscript(video) {
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
        return await this.getL2Transcript();
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
          this.args
        }&filter[l2][eq]=${
          this.$l2.id
        }&fields=id,youtube_id,channel_id,l2,title,level,topic,lesson,subs_l2&timestamp=${
          this.$settings.adminMode ? Date.now() : 0
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
        if (e.target.tagName.toUpperCase() !== "INPUT" && !e.metaKey) {
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
  bottom: 1rem;
  text-align: center;
  z-index: 9;
}

.quick-access-button.play-pause {
  transform: scale(1.5);
  margin: 0 0.6rem;
}

.quick-access-button {
  border-radius: 100%;
  width: 2.5rem;
  height: 2.5rem;
  line-height: 2.5rem;
  border: none;
  font-size: 1.3em;
  cursor: pointer;
  text-align: center;
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
}

.youtube-view-line-list {
  position: fixed;
  width: 25rem;
  max-height: calc(100vh - 10rem);
  overflow: scroll;
  border-radius: 0.3rem;
  background: white;
  z-index: 10;
  left: calc(50vw - 12.5rem);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  bottom: 4rem;
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
