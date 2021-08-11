<router>
  {
    path: '/:l1/:l2/youtube/search/:term?/:start?',
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
  <div class="main">
    <div class="container pt-5 pb-5 youtube-search">
      <h3 class="text-center mb-5">
        Search YouTube for videos with {{ $l2.name }} CC
      </h3>
      <SimpleSearch
        :placeholder="$t('Enter a search term in {l2}...', { l2: $l2.name })"
        :action="
          (url) => {
            let path = `/${$l1.code}/${
              $l2.code
            }/youtube/search/${encodeURIComponent(url)}/0`;
            if (this.$router.currentRoute.path === path) this.searchResultKey++;
            else this.$router.push({ path: path });
          }
        "
        ref="search"
      />
      <b-form-group class="mt-3">
        <b-form-radio
          v-model="captions"
          class="d-inline-block mr-3"
          value="captions"
        >
          With Captions
        </b-form-radio>
        <b-form-radio
          v-model="captions"
          class="d-inline-block mr-3"
          value="nocaptions"
        >
          No Captions
        </b-form-radio>
        <b-form-radio
          v-model="captions"
          class="d-inline-block mr-3"
          value="all"
        >
          All
        </b-form-radio>
        <b-form-checkbox v-model="long" class="d-inline-block mr-3">
          Only long videos (20m+)
        </b-form-checkbox>
        <b-button class="btn-small btn-primary ml-3" @click="forceRefresh">
          <i class="fa fa-sync-alt mr-1"></i>
          Force Refresh
        </b-button>
        <b-button
          v-if="!moreLoaded"
          class="btn-small btn-secondary ml-1"
          @click="loadMore"
        >
          <i class="fa fa-cloud mr-1"></i>
          Load {{ maxPages }} pages
        </b-button>
      </b-form-group>
      <YouTubeSearchResults
        :term="term"
        :start="start"
        :captions="captions"
        class="mt-5"
        :key="searchResultKey"
        :long="long"
        :infinite="true"
        ref="youtubeSearchResults"
      />
    </div>
  </div>
</template>

<script>
import SimpleSearch from "@/components/SimpleSearch";
import YouTubeSearchResults from "@/components/YouTubeSearchResults";

export default {
  components: {
    SimpleSearch,
    YouTubeSearchResults,
  },
  data() {
    return {
      captions: "all",
      searchResultKey: 0,
      checkSaved: false,
      long: false,
      maxPages: 30,
      moreLoaded: false,
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
  },
  props: {
    term: {
      type: String,
    },
    start: {
      default: 0,
    },
  },
  watch: {
    term() {
      this.updateSearchText();
    },
  },
  mounted() {
    this.updateSearchText();
    this.long = this.$route.query.long === "true" ? true : false;
    this.captions = this.$route.query.captions || "all";
  },
  methods: {
    async updateSearchText() {
      if (this.term) {
        let url = decodeURIComponent(this.term);
        this.$refs.search.text = url;
      }
    },
    addAll() {
      this.$refs.youtubeSearchResults.addAll();
    },
    forceRefresh() {
      this.$refs.youtubeSearchResults.forceRefresh();
    },
    async loadMore() {
      this.moreLoaded = true;
      let hasMore;
      for (let i = 0; i < this.maxPages; i++) {
        hasMore = await this.$refs.youtubeSearchResults.loadMore();
        if (!hasMore) break;
      }
    },
  },
};
</script>

<style>
</style>
