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
            <div class="d-flex mt-4 mb-3" v-if="(videos && videos.length > 0) || keyword">
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
          <div
            :class="{
              'loader text-center mt-5 mb-5': true,
              'd-none': videos,
            }"
            style="flex: 1"
          >
            <Loader :sticky="true" message="Loading videos in our library..." />
          </div>
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
          <div v-observe-visibility="visibilityChanged"></div>
          <div
            :class="{
              'no-videos-message': true,
            }"
          >
            <h5 v-if="!keyword && videos && videos.length === 0">
              Oh no, we don't have any new {{ $l2.name }} videos. We need your help
              to expand our library!
            </h5>
            <h5 v-else-if="keyword">No search results matching your keywords. Help us add some!</h5>
            <h5 v-else>Help us expand our library!</h5>
            <p class="mt-4">There are TWO WAYS you can add videos to our library.</p>
            <h6 class="mt-4">METHOD 1: Use our YouTube search tool</h6>
            <ol>
              <li>
                Open our
                <router-link
                  :to="{
                    name: 'youtube-search',
                    params: { term: `${$l2.name} language` },
                  }"
                >
                  YouTube Search Tool
                </router-link>
                and search for {{ $l2.name }} videos. (In the search results,
                videos without {{ $l2.name }} captions are automatically grayed
                out, although you can still open them.)
              </li>
              <li>
                If you don't see any results, try using the option "No
                captions, more results."
              </li>
              <li>Open any video (preferably those that are not grayed out).</li>
              <li>
                Click the "+ Add to Videos" button to add it to our library.
              </li>
              <li>
                If the "+ Add to Videos" button is missing, you need to add
                closed captions first by dragging and dropping a subtitles file
                (SRT or ASS).
              </li>
            </ol>
            <h6 class="mt-4">METHOD 2: Search on YouTube directly</h6>
            <ol>
              <li>
                Install the "Open in Zero to Hero" this bookmarklet. Drag this
                link to your browser's bookmarks bar:
                <a :href="bookmarkletHref" class="btn btn-small btn-ghost-dark">
                  Open in Zero to Hero
                </a>
              </li>
              <li>
                Open
                <a
                  :href="`https://www.youtube.com/results?search_query=${$l2.name}+language&sp=EgIoAQ%253D%253D`"
                >
                  YouTube
                </a>
                , and search for {{ $l2.name }} videos, preferrably those that
                have {{ $l2.name }} closed captions (CC).
              </li>
              <li>
                From YouTube (either a video page or a playlist page), click on the bookmarklet you
                just added in Step 1.
                <b>
                  When prompted to enter the language code for {{ $l2.name }},
                  enter “{{ $l2.code }}”.
                </b>
                This will open that video on our website.
              </li>
              <li>
                Click the "+ Add to Videos" button to add it to our library.
              </li>
              <li>
                If the "+ Add to Videos" button is missing, you need to add
                closed captions first by dragging and dropping a subtitles file
                (SRT or ASS).
              </li>
            </ol>
            <hr />
            <div>
              Questions? Mention me on Twitter
              <a href="https://twitter.com/zerotoherolang" target="_blank">
                <u>@zerotoherolang</u>
              </a>
              and I'll help you out. Thanks for contributing!
            </div>
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
      bookmarkletHref: `javascript:(function()%7B(function() %7B%0A    let l2 %3D window.prompt("Enter language code (e.g. 'ja' for Japanese)%3A")%3B%0A    let open %3D (%7Bparams%2C channelId%2C playlistTitle%2C channelTitle%2C external%3Dfalse%7D%3D%7B%7D)%3D>%7B%0A        let url%0A        let baseUrl %3D 'https%3A%2F%2Fwww.zerotohero.ca'%0A        if (params.list) %7B%0A            url %3D %60%24%7BbaseUrl%7D%2Fen%2F%24%7Bl2%7D%2Fyoutube%2Fplaylist%2F%24%7Bparams.list%7D%2F%24%7BencodeURIComponent(playlistTitle)%7D%60%0A        %7D else if (params.v) %7B%0A            url %3D %60%24%7BbaseUrl%7D%2Fen%2F%24%7Bl2%7D%2Fyoutube%2Fview%2F%24%7Bparams.v%7D%60%0A            window.open()%0A        %7D else if (channelId) %7B%0A            url %3D %60%24%7BbaseUrl%7D%2Fen%2F%24%7Bl2%7D%2Fyoutube%2Fchannel%2F%24%7BchannelId%7D%2F%24%7BencodeURIComponent(channelTitle)%7D%60%0A        %7D%0A        if (url) %7B%0A            if (external)%0A                window.open(url)%0A            else%0A                window.location.href %3D url%0A        %7D%0A    %7D%0A    if (window.location.href.includes('results')) %7B%0A        let nodes %3D document.querySelectorAll('ytd-playlist-renderer')%0A        let playlists %3D %5B%5D%0A        for (let node of %5B...nodes%5D) %7B%0A            let playlistTitle %3D node.querySelector('%23video-title').innerText%0A            let count %3D node.querySelector('.style-scope.ytd-thumbnail-overlay-side-panel-renderer').innerText%0A            if (count.includes('K')) count %3D Number(count.replace('K'%2C '')) * 1000%0A            let url %3D node.querySelector('.yt-simple-endpoint').getAttribute('href')%0A            let search %3D url.replace(%2F%5C%2F%5B%5E%3F%5D%2B%2F%2C '')%0A            let urlSearchParams %3D new URLSearchParams(search)%3B%0A            let params %3D Object.fromEntries(urlSearchParams.entries())%3B%0A            playlists.push(%7B%0A                playlistTitle%2C%0A                count%2C%0A                params%0A            %7D)%0A        %7D%0A        playlists %3D playlists.sort((a%2Cb)%3D>b.count - a.count)%0A        console.log('Opening the longest 10 playlists on this page...')%0A        for (let playlist of playlists.slice(0%2C 10).reverse()) %7B%0A            let %7Bparams%2C playlistTitle%2C count%7D %3D playlist%0A            open(%7B%0A                params%2C%0A                playlistTitle%2C%0A                external%3A true%0A            %7D)%0A        %7D%0A    %7D else %7B%0A        let urlSearchParams %3D new URLSearchParams(window.location.search)%3B%0A        let params %3D Object.fromEntries(urlSearchParams.entries())%3B%0A        let playlistTitle%2C channelTitle%2C channelId%0A        if (params.list)%0A            playlistTitle %3D document.querySelector('.title.style-scope.ytd-playlist-panel-renderer').innerText.trim()%0A        if (window.location.href.includes('https%3A%2F%2Fwww.youtube.com%2Fchannel%2F')) %7B%0A            channelId %3D window.location.href.replace(%2F.*%5C%2Fchannel%5C%2F(%5B%5E%2F%3F%5D%2B).*%3F%2F%2C "%241")%0A            channelTitle %3D document.querySelector('.style-scope.ytd-channel-name').innerText.trim()%0A        %7D%0A        open(%7B%0A            params%2C%0A            channelId%2C%0A            playlistTitle%2C%0A            channelTitle%0A        %7D)%0A    %7D%0A%7D%0A)()%7D)()%3B`,
      channels: [],
      videos: undefined,
      levels: Helper.levels(this.$l2),
      topics: Helper.topics,
      randomEpisodeYouTubeId: undefined,
      moreVideos: 0,
      perPage: 12,
      includeShows: true,
      topicData: this.topic,
      topics,
    };
  },
  async fetch() {
    if (!this.keyword) this.includeShows = false;
    this.videos = await this.getVideos(this.start);
    this.channels = await this.getChannels();
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
  methods: {
    async visibilityChanged(isVisible) {
      if (this.videos && isVisible) {
        this.moreVideos = this.moreVideos + this.perPage;
        let newVideos = await this.getVideos(
          Number(this.start) + this.moreVideos
        );
        this.videos = this.videos.concat(newVideos);
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