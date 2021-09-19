<router>
  {
    path: '/:l1/:l2/youtube/browse/:topic?/:level?/:start?/:keyword?',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="main-dark">
    <div class="youtube-browse container pb-5">
      <SocialHead
        v-if="videos && videos[0]"
        :title="`Study ${$l2.name} videos with subs | ${$l2.name} Zero to Hero`"
        :description="`Watch ${$l2.name} videos and study the ${
          $l2.code === 'zh' ? 'Pinyin' : $l2.name
        } subtitles.`"
        :image="`https://img.youtube.com/vi/${videos[0].youtube_id}/hqdefault.jpg`"
      />

      <div class="row">
        <div class="col-sm-12 mb-4">
          <h3 v-if="!keyword" class="mt-5 text-center">
            {{ $t("{l2} Video Library", { l2: $t($l2.name) }) }}
          </h3>
          <p v-if="!keyword" class="mt-3 text-center">
            Study {{ $l2.name }} videos with
            {{ $l2.code === "zh" ? "Pinyin" : "" }} subtitles
          </p>
          <client-only>
            <Nav
              :l1="$l1"
              :l2="$l2"
              variant="page"
              class="youtube-browse-nav pt-4 pb-3"
              :showOnly="['Media']"
            />
          </client-only>
          <client-only>
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
                :random="
                  undefined !== randomEpisodeYouTubeId
                    ? `/${$l1.code}/${$l2.code}/youtube/view/${randomEpisodeYouTubeId}`
                    : false
                "
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
            <b-form-checkbox v-model="includeShows" v-if="$adminMode">
              Include videos in TV shows and talks
            </b-form-checkbox>
          </client-only>
        </div>
        <div class="col-sm-12 mb-5">
          <template v-if="videos && videos.length > 0">
            <YouTubeVideoList
              skin="dark"
              ref="youtubeVideoList"
              :videos="videos"
              :keyword="keyword"
              :checkSubs="false"
              :checkSaved="false"
              :showProgress="true"
              :showPlayButton="true"
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
          <div
            :class="{
              'no-videos-message': true,
            }"
          >
            <h5 v-if="!keyword && videos && videos.length === 0">
              Oh no, we don't have any new {{ $l2.name }} videos. We need your
              help to expand our library!
            </h5>
            <h5 v-else-if="keyword && videos && videos.length === 0">
              No search results matching your keywords. Help us add some!
            </h5>
            <h5 v-else>Help us expand our library!</h5>
            <LazyHowToContribute />
          </div>
          <LazyIdenticalLanguages class="mt-4" routeName="youtube-browse" />
          <client-only>
            <Nav
              :l1="$l1"
              :l2="$l2"
              variant="page"
              class="pt-5 youtube-browse-nav"
              :showOnly="['Media']"
            />
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import YouTubeNav from "@/components/YouTubeNav";
import YouTubeVideoList from "@/components/YouTubeVideoList";
import YouTubeChannelCard from "@/components/YouTubeChannelCard";
import SimpleSearch from "@/components/SimpleSearch";
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import YouTube from "@/lib/youtube";
import axios from "axios";

export default {
  components: {
    YouTubeNav,
    YouTubeVideoList,
    YouTubeChannelCard,
    SimpleSearch,
  },
  props: {
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
      levels: Helper.levels(this.$l2),
      topics: Helper.topics,
      randomEpisodeYouTubeId: undefined,
      moreVideos: 0,
      perPage: 96,
      includeShows: true,
      topicData: this.topic,
      topics,
      loading: false,
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
  async fetch() {
    if (!this.keyword || this.keyword.includes("channel:"))
      this.includeShows = false;
    this.videos = await this.getVideos(this.start);
    this.randomEpisodeYouTubeId = await YouTube.getRandomEpisodeYouTubeId(
      this.$l2.id,
      this.$store.state.shows.tvShows[this.$l2.code] ? "tv_show" : undefined
    );
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
    if (this.keyword) {
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
      if (this.videos && isVisible) {
        this.moreVideos = this.moreVideos + this.perPage;
        this.loading = true;
        let newVideos = await this.getVideos(
          Number(this.start) + this.moreVideos
        );
        this.videos = this.videos.concat(newVideos);
        this.loading = false;
      }
    },
    async getVideos(start) {
      let filters = "";
      if (!this.includeShows)
        filters = "&filter[tv_show][null]=1&filter[talk][null]=1";
      if (this.topic !== "all") {
        filters += "&filter[topic][eq]=" + this.topic;
      }
      if (this.level !== "all") {
        filters += "&filter[level][eq]=" + this.level;
      }
      if (this.keyword !== "") {
        if (this.keyword.startsWith("channel:"))
          filters +=
            "&filter[channel_id][eq]=" +
            encodeURIComponent(this.keyword.replace("channel:", ""));
        else
          filters +=
            "&filter[title][contains]=" + encodeURIComponent(this.keyword);
        filters += "&sort=title";
      }
      let limit = this.perPage;
      try {
        let response = await axios.get(
          `${Config.wiki}items/youtube_videos?sort=-id&filter[l2][eq]=${
            this.$l2.id
          }${filters}&limit=${limit}&offset=${start}&fields=channel_id,id,lesson,level,title,topic,youtube_id,tv_show.*,talk.*${
            this.$adminMode ? ",subs_l2" : ""
          }&timestamp=${this.$adminMode ? Date.now() : 0}`
        );
        let videos = response.data.data || [];
        if (videos && this.$adminMode) {
          videos = await YouTube.checkShows(videos, this.$l2.id);
          for (let video of videos) {
            try {
              if (video.subs_l2)
                video.subs_l2 = YouTube.parseSavedSubs(video.subs_l2);
            } catch (err) {}
          }
        }
        videos =
          videos.sort((x, y) =>
            x.title
              ? x.title.localeCompare(y.title, this.$l2.locales[0], {
                  numeric: true,
                })
              : 0
          ) || [];
        return videos;
      } catch (err) {}
    },
    async getChannels() {
      let response = await axios.get(
        `${Config.wiki}items/youtube_channels?filter[language][eq]=${this.$l2.id}&fields=*,avatar.*`
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
  ::v-deep .feature-card-name-youtube-browse {
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