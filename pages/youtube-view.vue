<router>
  {
    path: '/:l1/:l2/youtube/view/:args?/:lesson?',
    props: true,
    meta: {
      title: 'YouTube Reader | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Watch YouTube videos and study the subtitles.'
        }
      ]
    }
  }
</router>
<template>
  <div class="youtube-view main pt-3 pb-5">
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <SimpleSearch
            class="mb-5"
            :placeholder="$t('Search YouTube', { l2: $l2.name })"
            buttonText="Search"
            :action="
              (url) => {
                this.$router.push({
                  path: `/${$l1.code}/${
                    $l2.code
                  }/youtube/search/${encodeURIComponent(url)}`,
                });
              }
            "
            ref="search"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12" v-if="video">
          <h5 :key="`video-title-${video.title}`">
            <Annotate :showTranslate="true">
              <span>{{ video.title }}</span>
            </Annotate>
          </h5>
          <div>
            <template v-if="video && !video.id">
              <b-button v-if="!saved" @click="save">
                <i class="fas fa-plus mr-2"></i>
                Add to Library
              </b-button>
              <b-button v-else variant="success">
                <i class="fa fa-check mr-2"></i>
                Added
              </b-button>
            </template>
            <b-dropdown
              id="dropdown-1"
              v-if="video && video.id"
              :text="video.topic ? topics[video.topic] : 'Topic'"
              :variant="video.topic ? 'success' : undefined"
              class="ml-1"
            >
              <b-dropdown-item
                v-for="(title, slug) in topics"
                :key="`change-topic-item-${slug}`"
                @click="changeTopic(slug)"
              >
                {{ title }}
              </b-dropdown-item>
            </b-dropdown>
            <template v-if="video && video.id && !video.lesson">
              <b-dropdown
                id="dropdown-1"
                :text="video.level ? levels[video.level] : 'Level'"
                :variant="video.level ? 'success' : undefined"
                class="ml-1"
              >
                <b-dropdown-item
                  v-for="(title, slug) in levels"
                  :key="`change-level-item-${slug}`"
                  @click="changeLevel(slug)"
                >
                  {{ title }}
                </b-dropdown-item>
              </b-dropdown>

              <b-button
                v-if="$settings.adminMode"
                variant="danger"
                @click="remove"
                class="ml-1"
              >
                <i class="fas fa-trash-alt"></i>
              </b-button>

              <drop
                v-if="$settings.adminMode"
                @drop="handleDrop"
                :class="{
                  over: over,
                  'subs-drop': true,
                  drop: true,
                  'ml-1': true,
                  'text-dark': true,
                  btn: true,
                  'btn-light': true,
                }"
                :key="`drop-${transcriptKey}`"
                @dragover="over = true"
                @dragleave="over = false"
              >
                Drop Subs Here
              </drop>
            </template>
          </div>
          <div v-if="$settings.adminMode && saved" class="mt-2">
            First line starts at
            <input
              v-model.lazy="firstLineTime"
              type="text"
              placeholder="0"
              class="d-inline-block ml-1"
              style="width: 4rem"
            />
            <b-button v-if="!subsUpdated" @click="updateSubs" class="ml-2">
              <i class="fa fa-save mr-2"></i>
              Update Subs
            </b-button>
            <b-button v-else variant="success" class="ml-2">
              <i class="fa fa-check mr-2"></i>
              Updated
            </b-button>
          </div>
          <hr class="mt-3" />
          <YouTubeChannelCard
            v-if="video.channel"
            :channel="video.channel"
            :key="`channel-${video.channel.id}`"
            class="mb-4 d-inline-block"
          />
        </div>
      </div>
    </div>
    <div v-if="!video" class="text-center">
      <Loader :sticky="true" />
    </div>
    <YouTubeWithTranscript
      v-if="video"
      :youtube="video.youtube_id"
      ref="youtube"
      :l2Lines="video.subs_l2"
      :quiz="true"
      :key="`transcript-${video.youtube_id}-${transcriptKey}`"
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
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-12 p-5" id="comments">
          <h4 class="mt-5 mb-4">
            {{ $t("Comments") }}
          </h4>
          <div class="comments">
            <Disqus
              shortname="zero-to-hero"
              :identifier="`youtube-view-${args}`"
              :url="`https://www.zerotohero.ca//${$l1.code}/${$l2.code}/youtube/view/${args}`"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import YouTubeWithTranscript from "@/components/YouTubeWithTranscript";
import YouTubeChannelCard from "@/components/YouTubeChannelCard";
import SimpleSearch from "@/components/SimpleSearch";
import YouTubeSearchResults from "@/components/YouTubeSearchResults";
import YouTube from "@/lib/youtube";
import Helper from "@/lib/helper";
import Config from "@/lib/config";
import axios from "axios";
import { Drag, Drop } from "vue-drag-drop";
import { parseSync } from "subtitle";
import { parse } from "node-html-parser";

export default {
  components: {
    YouTubeSearchResults,
    SimpleSearch,
    YouTubeChannelCard,
    YouTubeWithTranscript,
    Drag,
    Drop,
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
  },
  watch: {
    firstLineTime() {
      if (this.video.subs_l2 && this.video.subs_l2.length > 0) {
        let subsShift =
          Number(this.firstLineTime) - Number(this.video.subs_l2[0].starttime);
        if (subsShift !== 0) {
          for (let line of this.video.subs_l2) {
            line.starttime = Number(line.starttime) + subsShift;
          }
        }
        this.transcriptKey++;
      }
    },
  },
  data() {
    return {
      l2Locale: undefined,
      video: undefined,
      levels: Helper.levels(this.$l2),
      topics: Helper.topics,
      transcriptKey: 0,
      firstLineTime: 0,
      subsUpdated: false,
      over: false,
      paused: false,
      speed: 1,
    };
  },
  head() {
    if (this.video) {
      return {
        title: `Learn Chinese from a TV Show | ${this.$l2.name} Zero to Hero`,
        meta: [
          {
            hid: `description`,
            name: "description",
            content: `Watch the video "${this.video.title}", study the subtitles and improve your Chinese! Full transcript: ${this.video.subs_l2.map(l => l.line).join(' ')}`,
          },
          {
            hid: "og:url",
            property: "og:url",
            content: `https://www.zerotohero.ca${this.$route.fullPath}`,
          },
          {
            hid: "og:title",
            property: "og:title",
            content: `Learn Chinese from a TV Show | ${this.$l2.name} Zero to Hero`,
          },
          {
            hid: "og:description",
            property: "og:description",
            content: `Watch the video "${this.video.title}", study the subtitles and improve your Chinese! Full transcript: ${this.video.subs_l2.map(l => l.line).join(' ')}`,
          },
          {
            hid: "og:image",
            property: "og:image",
            content: `https:///img.youtube.com/vi/${this.video.youtube_id}/hqdefault.jpg`,
          },
          {
            hid: "twitter:url",
            name: "twitter:url",
            content: `https://www.zerotohero.ca${this.$route.fullPath}`,
          },
          {
            hid: "twitter:title",
            name: "twitter:title",
            content: `Learn Chinese from a TV Show | ${this.$l2.name} Zero to Hero`,
          },
          {
            hid: "twitter:description",
            name: "twitter:description",
            content: `Watch the video "${this.video.title}", study the subtitles and improve your Chinese! Full transcript: ${this.video.subs_l2.map(l => l.line).join(' ')}`,
          },
          {
            hid: "twitter:image",
            name: "twitter:image",
            content: `https://img.youtube.com/vi/${this.video.youtube_id}/hqdefault.jpg`,
          },
        ],
      };
    }
  },
  async fetch() {
    // this.$refs.search.url = `https://www.youtube.com/watch?v=${this.args}`
    let video = await this.getSaved();
    if (this.lesson && this.video.level && this.video.lesson) {
      this.saveWords(this.video.level, this.video.lesson);
    }
    if (!video || !video.channel_id) {
      video = Object.assign(video, await YouTube.videoByApi(this.args));
    }
    video.subs_l2 = await this.getTranscript(video);
    if (video.subs_l2 && video.subs_l2.length > 0) {
      this.firstLineTime = video.subs_l2[0].starttime;
    }
    if (video && !video.channel_id) {
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
    handleDrop(data, event) {
      event.preventDefault();
      let file = event.dataTransfer.files[0];
      let reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (event) => {
        let srt = event.target.result;
        this.video.subs_l2 = parseSync(srt).map((cue) => {
          return {
            starttime: cue.data.start / 1000,
            line: cue.data.text,
          };
        });
        console.log("loaded");
        this.firstLineTime = this.l2_lines[0].starttime;
        this.hasSubtitles = true;
        this.transcriptKey++;
      };
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

      let html = await Helper.proxy(
        `https://www.youtube.com/api/timedtext?v=${this.args}&type=list`
      );
      let root = parse(html);
      for (let track of root.querySelectorAll("track")) {
        let locale = track.getAttribute("lang_code");
        if (locales.includes(locale)) {
          this.l2Locale = locale;
        }
      }

      if (this.l2Locale) {
        html = await Helper.proxy(
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
    },
    async save() {
      let response = await axios.post(
        `${Config.wiki}items/youtube_videos`,
        Object.assign(this.video, {
          l2: this.$l2.id,
          subs_l2: JSON.stringify(this.video.subs_l2),
        })
      );
      if (response) {
        this.video.id = response.data.id;
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
      this.hasSubtitles = true;
    },
    async getTranscript(video) {
      if (Array.isArray(video.subs_l2)) {
        return video.subs_l2
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
    async updateSubs() {
      let response = await $.ajax({
        url: `${Config.wiki}items/youtube_videos/${this.video.id}`,
        data: JSON.stringify({ subs_l2: JSON.stringify(this.video.subs_l2) }),
        type: "PATCH",
        contentType: "application/json",
        xhr: function () {
          return window.XMLHttpRequest == null ||
            new window.XMLHttpRequest().addEventListener == null
            ? new window.ActiveXObject("Microsoft.XMLHTTP")
            : $.ajaxSettings.xhr();
        },
      });
      if (response && response.data) {
        this.subsUpdated = true;
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
    async changeLevel(slug) {
      let response = await $.ajax({
        url: `${Config.wiki}items/youtube_videos/${this.video.id}`,
        data: JSON.stringify({ level: slug }),
        type: "PATCH",
        contentType: "application/json",
        xhr: function () {
          return window.XMLHttpRequest == null ||
            new window.XMLHttpRequest().addEventListener == null
            ? new window.ActiveXObject("Microsoft.XMLHTTP")
            : $.ajaxSettings.xhr();
        },
      });
      if (response && response.data) {
        this.video = response.data;
      }
    },
    async changeTopic(slug) {
      let response = await $.ajax({
        url: `${Config.wiki}items/youtube_videos/${this.video.id}`,
        data: JSON.stringify({ topic: slug }),
        type: "PATCH",
        contentType: "application/json",
        xhr: function () {
          return window.XMLHttpRequest == null ||
            new window.XMLHttpRequest().addEventListener == null
            ? new window.ActiveXObject("Microsoft.XMLHTTP")
            : $.ajaxSettings.xhr();
        },
      });
      if (response && response.data) {
        this.video = response.data;
      }
    },
    async remove() {
      let response = await $.ajax({
        url: `${Config.wiki}items/youtube_videos/${this.video.id}`,
        type: "DELETE",
        contentType: "application/json",
        xhr: function () {
          return window.XMLHttpRequest == null ||
            new window.XMLHttpRequest().addEventListener == null
            ? new window.ActiveXObject("Microsoft.XMLHTTP")
            : $.ajaxSettings.xhr();
        },
      });
      if (response) {
        this.video = undefined;
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
          if (e.keyCode == 32) {
            // Spacebar
            this.togglePaused();
            return false;
          }
          if (e.keyCode == 38) {
            // Up arrow
            this.$refs.transcript.previousLine();
            return false;
          }
          if (e.keyCode == 40) {
            // Down arrow
            this.$refs.transcript.nextLine();
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
.subs-drop.drop.over {
  border: 2px dashed #ccc;
}
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
.youtube-video-column.sticky {
  top: 0;
}
.youtube-video-wrapper.sticky {
  top: 0;
}
</style>
