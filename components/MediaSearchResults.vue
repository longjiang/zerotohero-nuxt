<template>
  <div class="media-search-results">
    <div class="row">
      <div class="col-sm-12">
        <div v-show="title && videos?.length">
          <h5>
            {{ $t(title) }}
            <router-link
              v-if="toMore"
              :to="toMore"
              class="show-all"
            >
              {{ $t("More") }}
              <i class="fas fa-chevron-right"></i>
            </router-link>
          </h5>
          <RecommendedMessage class="mt-2" v-if="showRecommendedMessage" />
          <hr class="my-4" />
        </div>
        <client-only>
          <div v-if="showSearchBar">
            <div
              class="d-flex mt-4 mb-3"
              v-if="(videos && videos.length > 0) || keyword"
            >
              <SimpleSearch
                placeholder="Search"
                ref="searchLibrary"
                class="mr-1"
                style="flex: 1"
                :skin="skin"
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
                {{ $t('Cateogry') }}
              </b-form-select>
            </div>
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
              {{ $t('Clear Search') }}
            </router-link>
          </div>
        </client-only>
      </div>
      <div class="col-sm-12">
        <template v-if="videos && videos.length > 0">
          <LazyYouTubeVideoList
            ref="youtubeVideoList"
            :skin="skin"
            :videos="videos"
            :defaultShowTitle="keyword"
            :checkSubs="false"
            :checkSaved="false"
            :showProgress="true"
            :showDate="true"
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
        <div v-if="videos?.length > 0" v-observe-visibility="visibilityChanged"></div>
        </div>
        <div v-if="videos && videos.length === 0 && noVideosMessage" class="no-videos-message">
          {{ $t(noVideosMessage) }}
      </div>
    </div>
  </div>
</template>

<script>
import YouTubeNav from "@/components/YouTubeNav";
import YouTubeChannelCard from "@/components/YouTubeChannelCard";
import SimpleSearch from "@/components/SimpleSearch";
import { uniqueByValue, LANGS_WITH_CONTENT, TOPICS } from "@/lib/utils";
import { mapState } from "vuex";

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
    tvShows: {
      default: null,
    },
    talks: {
      default: null,
    },
    excludeAllTVShows: {
      default: false
    },
    excludeAllTalks: {
      default: false
    },
    kidsOnly: {
      type: Boolean,
      default: false,
    },
    excludeKids: {
      type: Boolean,
      default: false,
    },
    noVideosMessage: {
      default: false,
    },
    showSearchBar: {
      default: false,
    },
    sort: {
      default: undefined, // '-views', '-date', 'title', '-date_created'
    },
    showPreferredCategoriesFirst: {
      default: false
    },
    perPage: {
      default: 96
    },
    infiniteScroll: {
      default: true
    },
    skin: {
      default: null
    },
    title: {
      type: String,
      default: null
    },
    showRecommendedMessage: {
      default: false
    },
    toMore: {
      type: Object,
    },
  },
  data() {
    let topics = [
      { value: "all", text: "All" },
      ...Object.entries(TOPICS).map(([value, text]) => {
        return { value, text };
      }),
    ];
    return {
      channels: [],
      videos: undefined,
      noMoreVideos: false,
      topics,
      moreVideos: 0,
      topicData: this.topic,
      loading: false,
      showDiscover: false,
    };
  },
  computed: {
    ...mapState("settings", ["preferredCategories"]),
  },
  async mounted() {
    this.videos = await this.getVideos(this.start);
    this.$emit("videosLoaded", this.videos);
  },
  watch: {
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
      if (!this.infiniteScroll) return
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
    getFilters() {
      let filters = [];
      if (this.excludeAllTVShows) {
        filters.push("filter[tv_show][null]=1");
      }
      if (this.excludeAllTalks) {
        filters.push("filter[talk][null]=1");
      }
      if (this.tvShows) {
        filters.push("filter[tv_show][in]=" + this.tvShows.join(","));
      } else if (!this.keyword) {
        filters.push("filter[tv_show][null]=1"); // By default we filter out videos in tv shows
      }
      if (this.talks) {
        filters.push("filter[talk][in]=" + this.talks.join(","));
      }
      if (this.topic !== "all" && !this.tvShows && !this.talk) {
        // Having tv show or talk filters overrides the topic filter
        filters.push("filter[topic][eq]=" + this.topic);
      }
      if (this.category !== "all" && !this.tvShows && !this.talks) {
        // Having tv show or talk filters overrides the category filter
        filters.push("filter[category][eq]=" + this.category);
      } else if (this.category === "all" && !this.keyword) {
        filters.push("filter[category][nin]=10,24"); // By default we filter out music videos
      }

      if (this.level !== "all") {
        filters.push("filter[level][eq]=" + this.level);
      }
      if (this.keyword !== "") {
        const words = this.keyword.split(' ');

        let titleKeywords = [];

        for (const word of words) {
          if (word.startsWith("channel:")) {
            filters.push(
              "filter[channel_id][eq]=" +
                encodeURIComponent(word.replace("channel:", ""))
            );
          } else if (word.startsWith("locale:")) {
            filters.push(
              "filter[locale][contains]=" +
                encodeURIComponent(word.replace("locale:", ""))
            );
          } else {
            titleKeywords.push(word);
          }
        }

        if (titleKeywords.length > 0) {
          filters.push(
            "filter[title][contains]=" + encodeURIComponent(titleKeywords.join(' '))
          );
        }
      }
      if (this.kidsOnly) {
        filters.push('filter[made_for_kids][eq]=1')
      }
      if (this.excludeKids) {
        filters.push('filter[made_for_kids][eq]=0')
        filters.push('filter[tags][ncontains]=kids')
      }
      return filters;
    },
    async getVideos(start) {
      this.noMoreVideos = false;
      let filters = this.getFilters();
      let limit = this.perPage;
      filters = filters.join("&");
      let fields = "fields=id,l2,title,youtube_id,tv_show,talk,date,lex_div,word_freq,difficulty";
      if (LANGS_WITH_CONTENT.includes(this.$l2.code))
        fields =
          fields +
          ",views,tags,category,locale,duration,made_for_kids,views,likes,comments";
      let timestamp = `timestamp=${this.$adminMode ? Date.now() : 0}`;
      let offset = `offset=${start}`;
      let limitStr = `limit=${limit}`;
      let sort = this.sort ? `sort=${this.sort}` : "";
      let query = [filters, limitStr, fields, offset, sort, timestamp]
        .filter((f) => f && f !== "")
        .join("&");
      let videos = await this.$directus.getVideos({ l2Id: this.$l2.id, query });
      videos = this.sortVideos(videos);
      if (videos && this.$adminMode) {
        videos = await this.$directus.checkShows(videos, this.$l2.id);
      }
      return videos
    },
    sortVideos(videos) {
      if (this.showPreferredCategoriesFirst) {
        videos = videos.sort((a, b) => {
          if (this.preferredCategories.includes(a.category)) {
            return -1;
          }
          if (this.preferredCategories.includes(b.category)) {
            return 1;
          }
          return 0;
        });
      }
      return videos
    },
    route() {
      let canonical = `/${this.$l1.code}/${this.$l2.code}/youtube/browse/${this.topic}/${this.level}/${this.start}`;
      if (!this.$router.currentRoute.path.startsWith(canonical)) {
        this.$router.push({ path: canonical });
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
  color: rgba(255, 255, 255, 0.767);
  border-radius: 0.25rem;
  padding: 2rem;
  width: 100%;
  text-align: center;
}
</style>