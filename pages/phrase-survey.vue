<router>
  {
    path: '/:l1/:l2/phrase-survey/:start?',
    props: true
  }
</router>
<template>
  <div class="main container mt-5">
    <div class="row">
      <div :class="{ 'col-sm-12 mb-5': true }">
        <h4 class="text-center mb-5">Phrase Survey</h4>
        <div class="text-center mb-4">
          Get phrases from up to {{ perPage }} episodes from:
          <b-form-select
            v-model="showSelect"
            :options="showOptions"
            style="display: inline-block; width: 20rem; margin-left: 1rem"
          ></b-form-select>
        </div>
        <div class="text-center mb-4">
          <b-button variant="primary" @click="getPhrases">Get Phrases</b-button>
        </div>
        <div
          :class="{
            'loader text-center mb-4': true,
            'd-none': !gettingPhrases,
          }"
          style="flex: 1"
        >
          <div class="heartbeat-loader"></div>
        </div>
        <div
          :class="{
            'text-center': true,
            'd-none': !videos || videos.length > 0,
          }"
        >
          No more videos to survey.
        </div>
        <template v-if="lines && lines.length > 0">
          <b-table
            small
            striped
            hover
            :items="lines.slice(0, numRowsVisible)"
            :fields="fields"
            responsive
          ></b-table>
        </template>
        <div v-observe-visibility="visibilityChanged"></div>
        <div class="mt-4 text-center">
          <router-link
            v-if="start > 9"
            :to="`/${$l1.code}/${$l2.code}/phrase-survey/${
              Number(start) - perPage
            }`"
            class="btn btn-default"
          >
            <i class="fa fa-chevron-left"></i>
          </router-link>
          <span class="ml-3 mr-3">Page {{ start / perPage + 1 }}</span>
          <router-link
            v-if="videos && videos.length > 0"
            :to="`/${$l1.code}/${$l2.code}/phrase-survey/${
              Number(start) + perPage
            }`"
            class="btn btn-default"
          >
            <i class="fa fa-chevron-right"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import axios from "axios";
import YouTube from "@/lib/youtube";
import Helper from "@/lib/helper";
import he from "he";

export default {
  props: {
    start: {
      default: 0,
    },
  },
  data() {
    return {
      videos: undefined,
      lines: undefined,
      maxVideos: 2000, // False = infinite number of videos
      perPage: 2000,
      chunkSize: 200, // Number of videos stored in each localStorage item in getAllLinesFromLocalStorage
      punctuations: "。！？；：!?;:,.♪",
      fields: ["line", "count"],
      numRowsVisible: 20,
      showSelect: "all-tv-shows",
      shows: undefined,
      gettingPhrases: false,
    };
  },
  mounted() {
    this.loadShows();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
    console.log(`All done. Displaying table...`);
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  methods: {
    loadShows() {
      this.shows = this.$store.state.shows.tvShows[this.$l2.code]
        ? this.$store.state.shows.tvShows[this.$l2.code]
        : undefined;
    },
    async getPhrases() {
      this.gettingPhrases = true;
      this.videos = await this.getAllVideos();
      console.log(`Got ${this.videos.length} videos in total.`);
      this.lines = this.crunchPhrases(this.videos);
      this.gettingPhrases = false;
    },
    visibilityChanged(isVisible) {
      if (isVisible) {
        this.numRowsVisible = this.numRowsVisible + 100;
      }
    },
    async getAllVideos() {
      let start = this.start;
      let videos = await this.getVideos(this.showSelect, start, this.perPage);
      let allVideos = [];
      let page = 0;
      while (
        videos.length > 0 &&
        (!this.maxVideos || allVideos.length < this.maxVideos)
      ) {
        allVideos = allVideos.concat(videos);
        page++;
        videos = await this.getVideos(
          this.showSelect,
          start + this.perPage * page,
          this.perPage
        );
      }
      return allVideos;
    },
    crunchPhrases(videos) {
      console.log(`Collecting lines...`);
      let lines = videos.reduce(
        (allLines, video) =>
          allLines.concat(video.subs_l2.map((line) => {
            let str = line.line
            str = he.decode(str)
            return str
          })),
        []
      );
      console.log(`Splitting and joining ${lines.length} lines...`);
      lines = lines
        .join("\n")
        .replace(new RegExp(`[${this.punctuations}]`, "g"), "\n")
        .split("\n")
        .map((line) => line.replace(/^\s*[-–]\s*/, "").trim())
        .filter((line) => line && line !== "")
        .map((line) => {
          return { line: line };
        });
      console.log(`Turned into ${lines.length} lines.`);
      lines = this.sortLines(lines);
      console.log(`Applying "unique" to all ${lines.length} lines...`);
      lines = Helper.uniqueByValue(lines, "line");
      return lines;
    },

    async getVideos(show, start, limit) {
      console.log(`Getting ${limit} videos...`);
      let showFilter
      if (show === "all-tv-shows") {
        showFilter = "&filter[tv_show][nnull]=1"
      } else if (show === 'all-talks') {
        showFilter = "&filter[talk][nnull]=1"
      } else if (show === 'all-videos') {
        showFilter = ""
      } else {
        showFilter = `&filter[tv_show][eq]=${show}`
      }
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?sort=-id&limit=${limit}&offset=${start}&filter[l2][eq]=${this.$l2.id}${showFilter}&fields=*,tv_show.*`
      );
      let videos = response.data.data || [];
      if (["all-tv-shows", "all-videos"].includes(show)) {
        videos = videos.filter(v => !v.tv_show || v.tv_show.title !== "Music")
      }
      console.log(`Got ${videos.length} videos.`);
      for (let video of videos) {
        video.subs_l2 = YouTube.parseSavedSubs(video.subs_l2);
      }
      return videos;
    },


    sortLines(lines) {
      console.log(`Sorting ${lines.length} lines by localeCompare()...`);
      let sortedLines = lines.sort((a, b) =>
        a.line.localeCompare(b.line, this.$l2.code)
      );
      console.log(`Folding ${lines.length} lines by uppercasing each one`);
      let foldedLines = [];
      if (sortedLines.length > 0) {
        let lastSeen = sortedLines[0];
        lastSeen.count = 0;
        for (let line of sortedLines) {
          if (
            line.line.toUpperCase() === lastSeen.line.toUpperCase()
          ) {
            lastSeen.count++;
          } else {
            foldedLines.push(lastSeen);
            lastSeen = line;
            lastSeen.count = 1;
          }
        }
      }
      console.log(`Sorting ${lines.length} lines by length then by count...`);
      foldedLines = foldedLines
        .sort((a, b) => a.line.length - b.line.length)
        .sort((a, b) => b.count - a.count);
      return foldedLines;
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    showOptions() {
      if (this.shows) {
        let options = [
          {
            value: "all-tv-shows",
            text: "All TV Shows",
          },
          ...this.shows.map((s) => {
            return {
              value: s.id,
              text: s.title,
            };
          }),
          {
            value: "all-talks",
            text: "All Talks",
          },
          {
            value: "all-videos",
            text: "All Videos",
          },
        ];
        return options;
      }
    },
  },
};
</script>
