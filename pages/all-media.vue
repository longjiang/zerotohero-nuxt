<router>
  {
    path: '/:l1/:l2/all-media',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="main-dark pb-5">
    <VideoHero v-if="randomVideos[0]" :video="random(randomVideos)[0]" />
    <div class="container">
      <SocialHead :title="`Learn ${$l2.name} with Videos | ${$l2.name} Zero to Hero`"
        :description="`Learn ${$l2.name} with Videos`" :image="'/img/tv-shows.jpg'" />
      <div class="row">
        <div class="col-sm-12">
          <!-- <Sale class="mt-5 mb-5" v-if="$l2.code === 'zh'" /> -->
          <SimpleSearch placeholder="Search" ref="searchLibrary" skin="dark" class="mt-4 mb-5" style="flex: 1" :action="
            (url) => {
              this.$router.push({
                path: `/${$l1.code}/${$l2.code
                  }/youtube/search/${encodeURIComponent(
                    url
                  )}`,
              });
            }
          " />
          <div v-if="videos && videos.length > 0">
            <h3 class="text-center mt-3 mb-4">
              Videos <router-link :to="{ name: 'youtube-browse' }" class="show-all">More <i class=" fas
                fa-chevron-right ml-1"></i></router-link>
            </h3>
            <LazyYouTubeVideoList :videos="randomVideos" :showAdminToolsInAdminMode="false" skin="dark" />
          </div>
          <div v-if="videos && movies && movies.length > 0">
            <h3 class="text-center mt-5 mb-5">
              Movies <router-link :to="{ name: 'show', params: { type: 'tv-show', id: moviesShow.id } }"
                class="show-all">More <i class=" fas
                fa-chevron-right ml-1"></i></router-link>
            </h3>
            <LazyYouTubeVideoList :videos="random(movies).slice(0, 12)" :showAdminToolsInAdminMode="false" skin="dark" />
          </div>
          <div v-if="videos && music && music.length > 0">
            <h3 class="text-center mt-5 mb-5">
              Music <router-link :to="{ name: 'show', params: { type: 'tv-show', id: musicShow.id } }" class="show-all">More <i class=" fas
                fa-chevron-right ml-1"></i></router-link>
            </h3>
            <LazyYouTubeVideoList :videos="random(music).slice(0, 12)" :showAdminToolsInAdminMode="false" skin="dark" />
          </div>
          <div v-if="videos && news && news.length > 0">
            <h3 class="text-center mt-5 mb-5">
              News <router-link :to="{ name: 'show', params: { type: 'talk', id: newsShow.id } }" class="show-all">More <i class=" fas
                fa-chevron-right ml-1"></i></router-link>
            </h3>
            <LazyYouTubeVideoList :videos="random(news).slice(0, 12)" :showAdminToolsInAdminMode="false" skin="dark" />
          </div>
          <div v-if="videos && tvShows && tvShows.length > 0">
            <h3 class="text-center mt-5 mb-5">
              TV Shows <router-link :to="{ name: 'tv-shows' }" class="show-all">More <i class=" fas
                fa-chevron-right ml-1"></i></router-link>
            </h3>
            <ShowList :shows="random(tvShows.filter(s => !['Movies', 'Music'].includes(s.title)), 6)" type="tvShows" :key="`tv-shows`" />
          </div>
          <div v-if="videos && talks && talks.length > 0">
            <h3 class="text-center mt-5 mb-5">
              YouTube<router-link :to="{ name: 'talks' }" class="show-all">More <i class=" fas
                fa-chevron-right ml-1"></i></router-link>
            </h3>
            <ShowList :shows="random(talks.filter(s => !['News'].includes(s.title) && !s.audiobook), 6)" type="talks" :key="`tv-shows`" />
            <div class="text-center mt-1">
            </div>
          </div>
          <div v-if="videos && talks && talks.length > 0 && audiobooks.length > 0">
            <h3 class="text-center mt-5 mb-5">
              Audiobooks <router-link :to="{ name: 'audiobooks' }" class="show-all">More <i class=" fas
                fa-chevron-right ml-1"></i></router-link>
            </h3>
            <ShowList :shows="random(audiobooks, 6)" type="talks" :key="`tv-shows`" />
          </div>
          <div
            :class="{
              'loader text-center mt-5 mb-5': true,
              'd-none': videos && !loading,
            }"
          >
            <Loader :sticky="true" message="Loading videos in our library..." class="mb-5" />
          </div>
          <LazyIdenticalLanguages class="mt-5 mb-5" routeName="all-media" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'
import Config from '@/lib/config'

export default {
  data() {
    return {
      videos: undefined,
      tvShows: undefined,
      talks: undefined,
      musicShow: undefined,
      moviesShow: undefined,
      newsShow: undefined,
      randomVideos: [],
      music: [],
      movies: [],
      news: [],
      loading: true,
    };
  },
  async fetch() {
    this.loadShows()
  },
  async mounted() {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
    if (!this.videos || this.videos.length === 0) this.videos = await this.getVideos({ limit: 50, sort: 'youtube_id' })
    this.randomVideos = this.videos.slice(0, 12)
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  computed: {
    audiobooks() {
      return this.talks.filter(t => t.audiobook)
    },
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
  methods: {
    async loadShows() {
      this.tvShows = this.$store.state.shows.tvShows[this.$l2.code]
      this.talks = this.$store.state.shows.talks[this.$l2.code]
      if (this.tvShows) {
        this.musicShow = this.$store.state.shows.tvShows[this.$l2.code].find(
          (s) => s.title === "Music"
        );
        this.moviesShow = this.$store.state.shows.tvShows[this.$l2.code].find(
          (s) => s.title === "Movies"
        );
        this.music = await this.getVideos({ limit: 100, tvShow: this.musicShow.id, sort: 'youtube_id' })
        this.movies = await this.getVideos({ limit: 100, tvShow: this.moviesShow.id, sort: 'youtube_id' })
      }
      if (this.talks) {
        this.newsShow = this.$store.state.shows.talks[this.$l2.code].find(
          (s) => s.title === "News"
        );
        this.news = await this.getVideos({ limit: 100, talk: this.newsShow.id })
      }
      this.loading = false
    },
    random(array, max) {
      let shuffled = Helper.shuffle(array)
      return shuffled.slice(0, max)
    },
    async getVideos({ limit = 10, tvShow = undefined, talk = undefined, sort = '-date' }) {
      try {
        let videos
        let filter = 'filter[tv_show][nnull]=1'
        if (tvShow) filter = `filter[tv_show][eq]=${tvShow}`
        if (talk) filter = `filter[talk][eq]=${talk}`

        let response = await axios.get(
          `${Config.youtubeVideosTableName(this.$l2.id)}?sort=${sort}&filter[l2][eq]=${this.$l2.id
          }&${filter}&limit=${limit}&fields=channel_id,id,lesson,level,title,topic,youtube_id,tv_show,talk`
        );
        if (response.data.data && response.data.data.length > 0) videos = response.data.data
        if (!videos && !tvShow && !talk) {
          response = await axios.get(
            `${Config.youtubeVideosTableName(this.$l2.id)}?sort=${sort}&filter[l2][eq]=${this.$l2.id
            }&limit=${limit}&fields=channel_id,id,lesson,level,title,topic,youtube_id,tv_show,talk`
          );
          videos = response.data.data || []
        }
        videos = Helper.uniqueByValue(videos, 'youtube_id')
        if (!tvShow & !talk) videos = Helper.uniqueByValue(Helper.uniqueByValue(videos, 'tv_show').concat(this.random(videos)), 'youtube_id')
        return videos
      } catch (err) {
        return []
      }
    },
    randBase64(length) {
      var result = '';
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
          charactersLength));
      }
      return result;
    }
  },
};
</script>

<style lang="scss" scoped>
.zerotohero-wide {
  .shows {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

@media (max-width: 576px) {
  .show-list-wrapper {
    max-width: 423px;
    margin: 0 auto;
  }
}

::v-deep .synced-transcript {
  height: 5rem;
  overflow: hidden;
}

h3 {
  position: relative;
}

.show-all {
  font-size: 0.7em;
  position: absolute;
  right: 0;
  top: 0.3em;
  display: block;
  color: #28a745;
}
</style>