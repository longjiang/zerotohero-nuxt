<router>
  {
    path: '/:l1/:l2/youtube/search/:term?/:start?',
    props: true,
    meta: {
      title: 'Search Media Library | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Search our media library and on YouTube for videos with subtitles.'
        }
      ],
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="main main-dark">
    <div class="container pt-3 pb-5 youtube-search">
      <div style="font-size: 1.5rem; color: white; text-align: center">
        <img
          src="/img/czh-icon.png"
          style="height: 4rem; margin-bottom: 1rem; margin-top: 3rem"
          data-not-lazy
        />
      </div>
      <h4 class="mt-3 mb-5 text-center">
        Zero to Hero
        <LanguageFlag :autocycle="true" :language="$l2" style="position: relative; bottom: 0.2rem; margin: 0 0.4rem" />
        Video Search
      </h4>
      <SimpleSearch
        :placeholder="`Search ${stats && stats[$l2.code] ? $n(stats[$l2.code].allVideos) : ''} ${$l2.name} videos`"
        skin="dark"
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
        :button="false"
      />
      <client-only>
        <b-form-group class="mt-3" v-if="$adminMode">
          <!-- <b-form-radio
            v-model="captions"
            class="d-inline-block mr-3"
            value="captions"
          >
            With Captions
          </b-form-radio> -->
          <b-form-radio
            v-model="captions"
            class="d-inline-block mr-3"
            value="all"
          >
            Yes captions
          </b-form-radio>
          <b-form-radio
            v-model="captions"
            class="d-inline-block mr-3"
            value="nocaptions"
          >
            No captions, more results
          </b-form-radio>
          <b-form-checkbox v-model="long" class="d-inline-block mr-3">
            Only long videos (20m+)
          </b-form-checkbox>
          <b-button
            v-if="$adminMode"
            class="btn-small btn-primary ml-3"
            @click="forceRefresh"
          >
            <i class="fa fa-sync-alt mr-1"></i>
            Force Refresh
          </b-button>
          <b-button
            v-if="!moreLoaded && $adminMode"
            class="btn-small btn-secondary ml-1"
            @click="loadMore"
          >
            <i class="fa fa-cloud mr-1"></i>
            Load {{ maxPages }} pages
          </b-button>
        </b-form-group>
      </client-only>
      <div v-if="term">
        <MediaSearchResults :keyword="term" class="mt-4" />
        <YouTubeSearchResults
          :term="term"
          :start="start"
          :captions="captions"
          :key="searchResultKey"
          :long="long"
          :infinite="true"
          :showProgress="false"
          skin="dark"
          ref="youtubeSearchResults"
          :cloakVideosWithoutSubs="!$adminMode"
        />
      </div>
      <!-- <FeedbackPrompt class="mt-5 mb-4" :skin="$route.meta ? $route.meta.skin : 'light'"/> -->
      <div v-if="term && term !== ''">
        <client-only>
          <Nav
            :l1="$l1"
            :l2="$l2"
            variant="page"
            class="youtube-browse-nav mt-5"
            :showOnly="['Media']"
          />
        </client-only>
        <LazyIdenticalLanguages routeName="youtube-search" class="mt-5" />
        <h4 class="mt-5 text-center">
          You can help to expand this {{ $l2.name }} video library!
        </h4>
        <LazyHowToContribute />
        <LazyIdenticalLanguages class="mb-4" routeName="youtube-browse" />
      </div>
    </div>
  </div>
</template>

<script>
import SimpleSearch from "@/components/SimpleSearch";
import YouTubeSearchResults from "@/components/YouTubeSearchResults";
import { mapState } from 'vuex';
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
    ...mapState('stats', ['stats']),
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
