<router>
  {
    path: '/:l1/:l2/text-survey/:start?',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5">
      <div class="row">
        <div :class="{ 'col-sm-12 mb-5': true }">
          <h4 class="text-center mb-5">Text Survey</h4>
          <div class="text-center mb-4">
            Get text from up to {{ perPage }} videos from:
            <b-form-select
              v-model="showSelect"
              :options="showOptions"
              style="display: inline-block; width: 20rem; margin-left: 1rem"
            ></b-form-select>
          </div>
          <div class="text-center mb-4">
            <a
              v-if="text"
              :href="textHref"
              :download="`${
                showOptions.find((o) => o.value === showSelect).text
              }.txt`"
              target="_blank"
              class="link-unstyled mr-2"
            >
              <i class="fa fa-download mr-1"></i>
              TXT
            </a>
            <b-button variant="success" @click="getText">Get Text</b-button>
          </div>
          <div
            :class="{
              'loader text-center mb-4': true,
              'd-none': !gettingPhrases,
            }"
            style="flex: 1"
          >
            <Loader :sticky="true" message="Getting phrases..." />
          </div>
          <div
            :class="{
              'text-center': true,
              'd-none': !videos || videos.length > 0,
            }"
          >
            No more videos to survey.
          </div>
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
import Vue from "vue";
import he from "he";

export default {
  props: {
    start: {
      default: 0,
    },
  },
  data() {
    return {
      chunkSize: 200, // Number of videos stored in each localStorage item in getAllLinesFromLocalStorage
      expand: {},
      gettingPhrases: false,
      maxVideos: 1500, // False = infinite number of videos
      numRowsVisible: 20,
      perPage: 1500,
      punctuations: undefined,
      shows: undefined,
      showSelect: "all-tv-shows",
      talks: undefined,
      videos: undefined,
      text: undefined,
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
    showOptions() {
      let options = [];
      if (this.shows) {
        options = options.concat([
          {
            value: "all-tv-shows",
            text: "All TV Shows (Except Music)",
          },
          ...this.shows.map((s) => {
            return {
              value: `show-${s.id}`,
              text: s.title,
            };
          }),
        ]);
      }
      if (this.talks) {
        options = options.concat([
          {
            value: "all-talks",
            text: "All Talks",
          },
          ...this.talks.map((s) => {
            return {
              value: `talk-${s.id}`,
              text: s.title,
            };
          }),
        ]);
      }
      options = options.concat([
        {
          value: "all-videos",
          text: "All Videos (Except Music)",
        },
      ]);
      return options;
    },
    textHref() {
      return Helper.makeTextFile(this.text);
    },
  },
  mounted() {
    this.loadShows();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
    this.punctuations = Helper.characterClass(
      "PunctuationNoApostropheNoHyphen"
    );
    console.log(`All done. Displaying table...`);
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  methods: {
    highlight() {
      return Helper.highlight(...arguments);
    },
    toggle(index) {
      Vue.set(this.expand, index, this.expand[index] ? false : true);
    },
    loadShows() {
      this.shows = this.$store.state.shows.tvShows[this.$l2.code]
        ? this.$store.state.shows.tvShows[this.$l2.code]
        : undefined;
      this.talks = this.$store.state.shows.talks[this.$l2.code]
        ? this.$store.state.shows.talks[this.$l2.code]
        : undefined;
    },
    async getText() {
      this.gettingPhrases = true;
      this.videos = await this.getAllVideos();
      console.log(`Got ${this.videos.length} videos in total.`);
      this.nGrams = this.generateText(this.videos);
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
      allVideos = allVideos.concat(videos);
      page++;
      videos = await this.getVideos(
        this.showSelect,
        start + this.perPage * page,
        this.perPage
      );
      return allVideos;
    },
    generateText(videos) {
      let texts = [];
      for (let video of videos) {
        texts.push(
          video.subs_l2.map((l) => he.decode(l.line).trim()).join(" ")
        );
      }
      this.text = texts.join(".");
    },

    async getVideos(show, start, limit) {
      console.log(`Getting ${limit} videos...`);
      let showFilter;
      if (show === "all-tv-shows") {
        showFilter = "&filter[tv_show][nnull]=1";
      } else if (show === "all-talks") {
        showFilter = "&filter[talk][nnull]=1";
      } else if (show === "all-videos") {
        showFilter = "";
      } else {
        if (show.startsWith("show-"))
          showFilter = `&filter[tv_show][eq]=${show.replace("show-", "")}`;
        else if (show.startsWith("talk-"))
          showFilter = `&filter[talk][eq]=${show.replace("talk-", "")}`;
      }
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?sort=-id&limit=${limit}&offset=${start}&filter[l2][eq]=${this.$l2.id}${showFilter}&fields=*,tv_show.*,talk.*`
      );
      let videos = response.data.data || [];
      if (["all-tv-shows", "all-videos"].includes(show)) {
        videos = videos.filter(
          (v) => !v.tv_show || v.tv_show.title !== "Music"
        );
      }
      console.log(`Got ${videos.length} videos.`);
      for (let video of videos) {
        video.subs_l2 = YouTube.parseSavedSubs(video.subs_l2);
      }
      return videos;
    },
  },
};
</script>
<style scoped>
</style>