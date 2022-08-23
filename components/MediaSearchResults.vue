<template>
  <div class="media-search-results">
    <div class="row">
      <div class="col-sm-12">
        <client-only>
          <div v-if="showSearchBar">
            <div
              class="d-flex mt-4 mb-3"
              v-if="(videos && videos.length > 0) || keyword"
            >
              <SimpleSearch
                placeholder="Search"
                ref="searchLibrary"
                skin="dark"
                class="mr-1"
                style="flex: 1"
                :action="
                  (url) => {
                    this.$router.push({
                      path: `/${$l1.code}/${
                        $l2.code
                      }/youtube/browse/${topic}/${level}/0/${encodeURIComponent(
                        url
                      )}`,
                    });
                  }
                "
              />
              <b-form-select
                v-model="topicData"
                :options="topics"
                class="select-ghost-dark"
                style="width: 7rem"
              >
                Category
              </b-form-select>
            </div>
            <b-form-checkbox
              v-model="includeShows"
              v-if="$adminMode"
              class="d-inline-block"
            >
              Include videos in TV shows and talks
            </b-form-checkbox>
            <router-link
              :to="{
                name: 'youtube-browse',
                params: {
                  topic,
                  level,
                  start: 0,
                  keyword: undefined,
                },
              }"
              v-if="keyword"
              class="ml-2 btn btn-small btn-ghost-dark"
            >
              Clear Search
            </router-link>
          </div>
        </client-only>
      </div>
      <div class="col-sm-12">
        <template v-if="videos && videos.length > 0">
          <LazyYouTubeVideoList
            skin="dark"
            ref="youtubeVideoList"
            :videos="videos"
            :defaultShowTitle="keyword"
            :checkSubs="false"
            :checkSaved="false"
            :showProgress="true"
            :showPlayButton="false"
          />
        </template>
        <div
          :class="{
            'loader text-center mt-5 mb-5': true,
            'd-none': videos && !loading,
          }"
          style="flex: 1"
        >
          <Loader :sticky="true" message="Loading videos in our library..." />
        </div>
        <div v-observe-visibility="visibilityChanged"></div>
        <!-- <div
          :class="{
            'no-videos-message': true,
          }"
          v-if="showNoVideosMessage && videos && videos.length === 0"
        >
          <h5 v-if="!keyword && videos && videos.length === 0">
            Oh no, we don't have any new {{ $l2.name }} videos. We need your
            help to expand our library!
          </h5>
          <h5 v-else-if="keyword && videos && videos.length === 0">
            No search results matching your keywords. Help us add some!
          </h5>
          <h5 v-else>Help us expand our library!</h5>
          <LazyHowToContribute /> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import YouTubeNav from "@/components/YouTubeNav";
import YouTubeChannelCard from "@/components/YouTubeChannelCard";
import SimpleSearch from "@/components/SimpleSearch";
import Helper from "@/lib/helper";

export default {
  components: {
    YouTubeNav,
    YouTubeChannelCard,
    SimpleSearch,
  },
  props: {
    category: {
      default: "all",
    },
    topic: {
      default: "all",
    },
    level: {
      default: "all",
    },
    keyword: {
      default: "",
    },
    start: {
      default: 0,
    },
    showLatestIfKeywordMissing: {
      default: false,
    },
    showNoVideosMessage: {
      default: false,
    },
    showSearchBar: {
      default: false,
    },
  },
  data() {
    let topics = [
      { value: "all", text: "All" },
      ...Object.entries(Helper.topics).map(([value, text]) => {
        return { value, text };
      }),
    ];
    return {
      channels: [],
      videos: undefined,
      noMoreVideos: false,
      topics: Helper.topics,
      moreVideos: 0,
      perPage: 96,
      includeShows: true,
      topicData: this.topic,
      topics,
      loading: false,
      showDiscover: false,
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
  async mounted() {
    if (!this.keyword || this.keyword.includes("channel:"))
      this.includeShows = false;
    this.videos = await this.getVideos(this.start);
    this.$emit("videosLoaded", this.videos);
  },
  watch: {
    async includeShows() {
      this.videos = await this.getVideos(this.start);
    },
    topicData() {
      this.$router.push({
        name: "youtube-browse",
        params: {
          topic: this.topicData,
          level: "all",
          start: 0,
        },
      });
    },
  },
  updated() {
    if (this.keyword && this.$refs.searchLibrary) {
      this.$refs.searchLibrary.text = this.keyword;
    }
  },
  beforeRouteEnter(to, from, next) {
    if (to.path.endsWith(`/youtube/browse`)) {
      next(`${to.path}/all/all/0`);
    }
    next();
  },
  methods: {
    async visibilityChanged(isVisible) {
      if (this.videos && !this.noMoreVideos && isVisible) {
        this.moreVideos = this.moreVideos + this.perPage;
        this.loading = true;
        let newVideos = await this.getVideos(
          Number(this.start) + this.moreVideos
        );
        this.videos = this.videos.concat(newVideos);
        if (newVideos.length < this.perPage) this.noMoreVideos = true;
        this.loading = false;
      }
    },
    async getVideos(start) {
      if (!this.keyword && !this.showLatestIfKeywordMissing) return [];
      this.noMoreVideos = false;
      let filters = [];
      let sort = "sort=-id";
      if (!this.includeShows) {
        filters.push("filter[tv_show][null]=1");
        filters.push("filter[talk][null]=1");
      }
      if (this.topic !== "all") {
        filters.push("filter[topic][eq]=" + this.topic);
      }
      if (this.category !== "all") {
        filters.push("filter[category][eq]=" + this.category);
      }
      if (this.level !== "all") {
        filters.push("filter[level][eq]=" + this.level);
      }
      if (this.keyword !== "") {
        if (this.keyword.startsWith("channel:"))
          filters.push(
            "filter[channel_id][eq]=" +
              encodeURIComponent(this.keyword.replace("channel:", ""))
          );
        else
          filters.push(
            "filter[title][contains]=" + encodeURIComponent(this.keyword)
          );
        sort = "&sort=title";
      }
      let limit = this.perPage;
      filters = filters.join(filters.join("&"));
      let fields = "fields=id,l2,title,youtube_id,tv_show.*,talk.*";
      let timestamp = `timestamp=${this.$adminMode ? Date.now() : 0}`;
      let offset = `offset=${start}`;
      let limitStr = `limit=${limit}`;
      let query = [filters, limitStr, fields, offset, timestamp]
        .filter((f) => f !== "")
        .join("&");
      let videos = await this.$directus.getVideos({ l2Id: this.$l2.id, query });
      if (videos && this.$adminMode) {
        videos = await this.$directus.checkShows(videos, this.$l2.id);
        for (let video of videos) {
          try {
            if (video.subs_l2)
              video.subs_l2 = this.$subs.parseSavedSubs(video.subs_l2);
          } catch (err) {}
        }
      }
      return videos;
    },
    async getChannels() {
      let response = await this.$directus.get(
        `items/youtube_channels?filter[language][eq]=${this.$l2.id}&fields=*,avatar.*`
      );
      if (response.data && response.data.length > 0) {
        let channels = response.data.data.map((channel) => {
          return {
            id: channel.channel_id,
            avatar:
              channel.avatar && channel.avatar !== null
                ? channel.avatar.data.full_url
                : undefined,
            title: channel.name,
            description: channel.description,
          };
        });
        return Helper.uniqueByValue(channels, "youtube_id");
      }
    },
    route() {
      let canonical = `/${this.$l1.code}/${this.$l2.code}/youtube/browse/${this.topic}/${this.level}/${this.start}`;
      if (!this.$router.currentRoute.path.startsWith(canonical)) {
        this.$router.push({ path: canonical });
      } else {
        this.$fetch();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.youtube-browse-nav {
  :deep(.feature-card-name-youtube-browse) {
    display: none;
  }
}
.no-videos-message {
  border: 2px dashed rgba(136, 136, 136, 0.5);
  color: rgba(255, 255, 255, 0.767);
  border-radius: 0.25rem;
  padding: 2rem;
}
</style>