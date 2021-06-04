<router>
  {
    path: '/:l1/:l2/youtube/browse/:topic?/:level?/:start?/:keyword?',
    props: true
  }
</router>
<template>
  <div class="youtube-browse container mb-5 main">
    <SocialHead
      v-if="videos[0]"
      :title="`Study ${$l2.name} videos with subs | ${$l2.name} Zero to Hero`"
      :description="`Watch ${$l2.name} videos and study the ${
        $l2.code === 'zh' ? 'Pinyin' : $l2.name
      } subtitles.`"
      :image="`https://img.youtube.com/vi/${videos[0].youtube_id}/hqdefault.jpg`"
    />
    <div class="row">
      <div class="col-sm-12 mb-4 text-center">
        <h3 v-if="!keyword" class=" mt-5">{{ $l2.name }} Video Library</h3>
        <p v-if="!keyword" class="mt-3">
          Study {{ $l2.name }} videos with
          {{ $l2.code === "zh" ? "Pinyin" : "" }} subtitles
        </p>
        <SimpleSearch
          class="mt-4 mb-3"
          placeholder="Search"
          ref="searchLibrary"
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
        <h3 v-if="keyword" class="mt-5 mb-4">{{ keyword }}</h3>
      </div>
      <div
        :class="{ 'col-sm-12 mb-5': true, 'col-md-8 col-lg-9': !keyword }"
      >
        <b-button
          v-if="$adminMode"
          class="btn btn-small bg-danger text-white mt-2 ml-2"
          @click="removeAll()"
        >
          <i class="fas fa-trash mr-2"></i>
          Remove All
        </b-button>
        <template v-if="videos && videos.length > 0">
          <YouTubeVideoList
            class="row"
            :videos="videos"
            :checkSubs="false"
            ref="youtubeVideoList"
            :checkSaved="false"
          />
        </template>
        <div class="mt-4 text-center" v-if="!keyword">
          <router-link
            v-if="start > 9"
            :to="`/${$l1.code}/${$l2.code}/youtube/browse/${topic}/${level}/${
              Number(start) - 12
            }${keyword ? '/' + keyword : ''}`"
            class="btn btn-default mr-2"
          >
            Previous
          </router-link>
          <router-link
            :to="`/${$l1.code}/${$l2.code}/youtube/browse/${topic}/${level}/${
              Number(start) + 12
            }${keyword ? '/' + keyword : ''}`"
            class="btn btn-default"
          >
            Next
          </router-link>
        </div>
      </div>
      <div v-if="!keyword" class="col-sm-12 col-md-4 col-lg-3">
        <div class="list-group">
          <router-link
            :class="{
              'link-unstyled': true,
              'list-group-item': true,
              'list-group-item-action': topic === 'all',
              active: topic === 'all',
            }"
            :to="`/${$l1.code}/${$l2.code}/youtube/browse/all/${level}/0`"
          >
            All
          </router-link>
          <router-link
            v-for="(topicName, topicValue) in topics"
            :class="{
              'link-unstyled': true,
              'list-group-item': true,
              'list-group-item-action': topicValue === topic,
              active: topicValue === topic,
            }"
            :to="`/${$l1.code}/${$l2.code}/youtube/browse/${topicValue}/all/0`"
          >
            {{ topicName }}
          </router-link>
        </div>
        <h6 class="mt-4 mb-4 text-center">Filter by Level</h6>
        <div class="list-group">
          <router-link
            :class="{
              'link-unstyled': true,
              'list-group-item': true,
              'list-group-item-action': level === 'all',
              active: level === 'all',
            }"
            :to="`/${$l1.code}/${$l2.code}/youtube/browse/${topic}/all/0`"
          >
            All
          </router-link>
          <router-link
            v-for="(levelName, levelValue) in levels"
            :class="{
              'link-unstyled': true,
              'list-group-item': true,
              'list-group-item-action': levelValue === level,
              active: levelValue === level,
            }"
            :to="`/${$l1.code}/${$l2.code}/youtube/browse/all/${levelValue}/0`"
          >
            {{ levelName }}
          </router-link>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-12">
        <hr />
        <h3 class="mt-5 mb-5 text-center">Search for More Videos on YouTube</h3>
        <SimpleSearch
          class="mb-3"
          :placeholder="
            $t('Search the entire YouTube for {l2} videos with CC', {
              l2: $l2.name,
            })
          "
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
    return {
      channels: [],
      videos: [],
      levels: Helper.levels(this.$l2),
      topics: Helper.topics,
      randomEpisodeYouTubeId: undefined,
    };
  },
  async fetch() {
    this.videos = await this.getVideos();
    this.channels = await this.getChannels();
    this.randomEpisodeYouTubeId = await YouTube.getRandomEpisodeYouTubeId(
      this.$l2.code,
      this.$l2.id
    );
  },
  methods: {
    removeAll() {
      this.$refs.youtubeVideoList.removeAll();
    },
    async getVideos() {
      let filters = "";
      if (this.topic !== "all") {
        filters += "&filter[topic][eq]=" + this.topic;
      }
      if (this.level !== "all") {
        filters += "&filter[level][eq]=" + this.level;
      }
      if (this.keyword !== "") {
        filters +=
          "&filter[title][contains]=" +
          encodeURIComponent(this.keyword) +
          "&sort=title";
      }
      let limit = this.keyword ? -1 : 12;
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?sort=-id&filter[l2][eq]=${
          this.$l2.id
        }${filters}&limit=${limit}&offset=${
          this.start
        }&fields=channel_id,id,lesson,level,title,topic,youtube_id${
          this.$adminMode ? ",subs_l2" : ""
        }&timestamp=${this.$adminMode ? Date.now() : 0}`
      );
      let videos = response.data.data || [];
      if (videos && this.$adminMode) {
        videos = await YouTube.checkShows(videos, this.$l2.id);
        for (let video of videos) {
          try {
            if (video.subs_l2) video.subs_l2 = JSON.parse(video.subs_l2);
          } catch (err) {}
        }
      }
      videos = Helper.uniqueByValue(videos, "youtube_id");
      return videos;
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
};
</script>
