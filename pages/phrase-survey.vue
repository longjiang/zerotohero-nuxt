<router>
  {
    path: '/:l1/:l2/phrase-survey/:start?',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5">
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
            <b-button variant="primary" @click="getPhrases">
              Get Phrases
            </b-button>
          </div>
          <div class="text-center pt-2 pb-2" v-if="videos">
            {{ videos.length }} videos surveyed.
            <router-link
              :to="{
                name: 'phrasebook-creator',
                params: {
                  csvProp: lines
                    .filter((l) => l.instances.length > 2)
                    .map((l) => l.phrase)
                    .slice(0, 1000)
                    .join('\n'),
                },
              }"
            >
              Make Phrasebook
            </router-link>
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
          <template v-if="lines && lines.length > 0">
            <b-table
              small
              striped
              hover
              :items="lines.slice(0, numRowsVisible)"
              :fields="fields"
              responsive
            >
              <template #cell(line)="data">
                <div>
                  {{ data.item.phrase }}
                </div>
                <div v-if="expand[data.index]" class="mt-2 mb-2 ml-2">
                  <div
                    v-for="(phrase, index) of data.item.instances"
                    :key="`phrase-${index}`"
                  >
                    <router-link
                      :to="{
                        name: 'video-view',
                        params: {
                          type: 'youtube',
                          youtube_id: phrase.youtube_id,
                        },
                        query: { t: phrase.starttime },
                      }"
                      class="link-unstyled d-flex mt-1 mb-1"
                      target="_blank"
                    >
                      <img
                        :src="`https://img.youtube.com/vi/${phrase.youtube_id}/hqdefault.jpg`"
                        :alt="phrase.title"
                      />
                      <div style="flex: 1">
                        <span
                          v-html="highlight(phrase.line, data.item.phrase)"
                        />
                      </div>
                    </router-link>
                  </div>
                </div>
              </template>
              <template #cell(count)="data">
                {{ data.item.instances.length }}
              </template>
              <template #cell(actions)="data">
                <b-button
                  size="sm"
                  variant="success"
                  @click="toggle(data.index)"
                >
                  <span v-if="expand[data.index]">Collapse</span>
                  <span v-if="!expand[data.index]">Expand</span>
                </b-button>
              </template>
            </b-table>
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
  </div>
</template>

<script>
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
      videos: undefined,
      lines: undefined,
      maxVideos: 1500, // False = infinite number of videos
      perPage: 1500,
      chunkSize: 200, // Number of videos stored in each localStorage item in getAllLinesFromLocalStorage
      punctuations: undefined,
      fields: ["line", "count", "actions"],
      numRowsVisible: 20,
      showSelect: "all-tv-shows",
      shows: undefined,
      talks: undefined,
      gettingPhrases: false,
      expand: {},
    };
  },
  computed: {
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
      allVideos = allVideos.concat(videos);
      page++;
      videos = await this.getVideos(
        this.showSelect,
        start + this.perPage * page,
        this.perPage
      );
      return allVideos;
    },
    crunchPhrases(videos) {
      console.log(`Collecting lines...`);
      let phrases = [];
      for (let video of videos) {
        for (let line of video.subs_l2) {
          let regex = new RegExp(`[${this.punctuations}]+`, "g");
          let segs = he
            .decode(line.line)
            .split(regex)
            .map((seg) => seg.trim())
            .filter((seg) => seg !== "" && !seg.match(/^\s*[-–—]+/));

          for (let seg of segs) {
            let phrase = {
              phrase: seg.trim(),
              youtube_id: video.youtube_id,
              title: video.title,
              tv_show: video.tv_show,
              talk: video.talk,
              line: line.line,
              starttime: line.starttime,
            };
            phrases.push(phrase);
          }
        }
      }
      let foldedPhrases = this.sortPhrases(phrases);
      return foldedPhrases;
    },

    /**
     * Sort phrases into groups
     * @param {array} phrases - Each item looks like:
     * {
     *   line: "'G obair ‘s an ghriain ag dhul faoi"
     *   phrase: "'G obair"
     *   starttime: 78.94
     *   talk: null
     *   title: "Cré Nó Cill - \"Worksong\" le Hozier as Gaeilge"
     *   tv_show: { . . . }
     *   youtube_id: "mv96TeiQZ9c"
     *  }
     */
    sortPhrases(phrases) {
      // First alphabetically sort all by the phrase
      let sortedPhrases = phrases
        .filter((p) => p.phrase !== "")
        .sort((a, b) =>
          a.phrase
            .toUpperCase()
            .localeCompare(b.phrase.toUpperCase(), this.$l2.locales[0])
        );
      // Put them all into groups (grouped by the phrase)
      let groups = [];
      if (sortedPhrases.length > 0) {
        let phrase = sortedPhrases[0].phrase;
        let group = {
          phrase,
          instances: [sortedPhrases[0]],
        };
        for (let phrase of sortedPhrases) {
          // Use case-insensitive comparison
          if (phrase.phrase.toUpperCase() === group.phrase.toUpperCase()) {
            group.instances.push(phrase);
          } else {
            groups.push(group);
            // Start a new group
            group = {
              phrase: phrase.phrase,
              instances: [phrase],
            };
          }
        }
      }
      console.log(`Folded into ${groups.length} groups.`);
      console.log(
        "Sort the groups, first by number of instances, then by the length of the phrase"
      );
      groups = groups
        .sort((a, b) => a.phrase.length - b.phrase.length)
        .sort((a, b) => b.instances.length - a.instances.length);
      console.log("Groups sorted");
      console.log(`Making groups unique...`);
      groups = Helper.uniqueByValue(groups, "phrase");
      console.log("Groups now unique.");
      return groups;
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
      let response = await this.$directus.get(
        `${this.$directus.youtubeVideosTableName(
          this.$l2.id
        )}?sort=-id&limit=${limit}&offset=${start}&filter[l2][eq]=${
          this.$l2.id
        }${showFilter}&fields=*,tv_show.*,talk.*`
      );
      let videos = response.data.data || [];
      if (["all-tv-shows", "all-videos"].includes(show)) {
        videos = videos.filter(
          (v) => !v.tv_show || v.tv_show.title !== "Music"
        );
      }
      console.log(`Got ${videos.length} videos.`);
      for (let video of videos) {
        video.subs_l2 = this.$subs.parseSavedSubs(video.subs_l2);
      }
      return videos;
    },
  },

  computed: {
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
  },
};
</script>
<style scoped>
.video-thumb {
  width: calc(0.2rem * 16);
  height: calc(0.2rem * 9);
  object-fit: cover;
  margin-right: 1rem;
}
</style>