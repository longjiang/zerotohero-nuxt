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
      } -- study the subtitles and improve your Chinese! ${
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
    <div class="container-fuid">
      <div class="row">
        <div class="col-sm-12">
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
        </div>
      </div>
    </div>
    <div v-if="!video" class="text-center">
      <Loader :sticky="true" />
    </div>
    <YouTubeWithTranscript
      v-if="video"
      :video="video"
      ref="youtube"
      :quiz="true"
      :key="`transcript-${video.youtube_id}`"
      :speed="speed"
      @paused="updatePaused"
    />
    <div class="play-pause-wrapper">
      <span
        class="speed shadow btn-secondary d-inline-block text-center"
        @click="speed = speed === 1 ? 0.75 : speed === 0.75 ? 0.5 : 1"
      >
        <i v-if="speed === 1" class="fas fa-tachometer-alt"></i>
        <span v-else style="font-size: 0.8em">{{ speed }}x</span>
      </span>
      <span
        class="play-pause shadow btn-primary d-inline-block text-center"
        @click="togglePaused"
      >
        <i v-if="paused" class="fas fa-play"></i>
        <i v-else class="fas fa-pause"></i>
      </span>
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
      paused: false,
      speed: 1,
    };
  },
  mounted() {
    this.bindKeys();
  },
  destroyed() {
    this.unbindKeys();
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
      if (root.transcript_list) {
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
      if (Array.isArray(video.subs_l2)) {
        return video.subs_l2;
      }
      if (video.subs_l2 && typeof video.subs_l2 === "string") {
        let savedSubs = JSON.parse(video.subs_l2);
        if (savedSubs) {
          return savedSubs.filter((line) => line.starttime);
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
        if (e.target.tagName.toUpperCase() !== "INPUT") {
          if (e.code === 'KeyM') {
            this.speed = this.speed === 1 ? 0.75 : this.speed === 0.75 ? 0.5 : 1
            return false;
          }
          if (e.keyCode == 32) {
            // Spacebar
            this.togglePaused();
            return false;
          }
          if (e.keyCode == 38) {
            // Up arrow
            this.$refs.youtube.$refs.transcript.previousLine();
            return false;
          }
          if (e.keyCode == 40) {
            // Down arrow
            this.$refs.youtube.$refs.transcript.nextLine();
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
<style lang="scss">
.play-pause-wrapper {
  position: sticky;
  bottom: 1rem;
  left: calc(100% - 4rem);
  width: 3.2rem;
  z-index: 9;
}
.play-pause {
  border-radius: 100%;
  width: 3.2rem;
  height: 3.2rem;
  line-height: 3rem;
  border: none;
  font-size: 1.3em;
  cursor: pointer;
}
.speed {
  border-radius: 100%;
  width: 3.2rem;
  height: 3.2rem;
  line-height: 3rem;
  border: none;
  font-size: 1.3em;
  cursor: pointer;
  margin-bottom: 0.2rem;
}
</style>
