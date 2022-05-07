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
                  }/youtube/browse/all/all/0/${encodeURIComponent(
                    url
                  )}`,
              });
            }
          " />
          <div v-if="videos && videos.length > 0">
            <h3 class="text-center mt-3 mb-4">
              New Arrivals
            </h3>
            <YouTubeVideoList :videos="random(videos).slice(0, 8)" :showAdminToolsInAdminMode="false" skin="dark" />
            <div class="text-center mt-1">
              <router-link class="btn btn-ghost-dark" :to="{ name: 'youtube-browse' }"> More New Arrivals <i class=" fas
                fa-chevron-right ml-1" style="opacity: 0.5"></i></router-link>
            </div>
          </div>
          <div v-if="videos && movies && movies.length > 0">
            <h3 class="text-center mt-5 mb-4">
              Movies
            </h3>
            <YouTubeVideoList :videos="random(movies).slice(0, 4)" :showAdminToolsInAdminMode="false" skin="dark" />
            <div class="text-center mt-1">
              <router-link class="btn btn-ghost-dark"
                :to="{ name: 'show', params: { type: 'tv-show', id: moviesShow.id } }"> More Movies <i class=" fas
                fa-chevron-right ml-1" style="opacity: 0.5"></i></router-link>
            </div>
          </div>
          <div v-if="videos && tvShows && tvShows.length > 0">
            <h3 class="text-center mt-5 mb-4">
              TV Shows
            </h3>
            <ShowList :shows="random(tvShows, 6)" type="tvShows" :key="`tv-shows`" />
            <div class="text-center mt-1">
              <router-link class="btn btn-ghost-dark" :to="{ name: 'tv-shows' }"> More TV Shows <i class=" fas
                fa-chevron-right ml-1" style="opacity: 0.5"></i></router-link>
            </div>
          </div>
          <div v-if="videos && talks && talks.length > 0">
            <h3 class="text-center mt-5 mb-4">
              YouTube Channels
            </h3>
            <ShowList :shows="random(talks, 6)" type="talks" :key="`tv-shows`" />
            <div class="text-center mt-1">
              <router-link class="btn btn-ghost-dark" :to="{ name: 'talks' }"> More YouTube Channels <i class=" fas
                fa-chevron-right ml-1" style="opacity: 0.5"></i></router-link>
            </div>
          </div>
          <div v-if="videos && talks && talks.length > 0 && audiobooks.length > 0">
            <h3 class="text-center mt-5 mb-4">
              Audiobooks
            </h3>
            <ShowList :shows="random(audiobooks, 6)" type="talks" :key="`tv-shows`" />
            <div class="text-center mt-1">
              <router-link class="btn btn-ghost-dark" :to="{ name: 'audiobooks' }"> More Audiobooks <i class=" fas
                fa-chevron-right ml-1" style="opacity: 0.5"></i></router-link>
            </div>
          </div>
          <div v-if="videos && music && music.length > 0">
            <h3 class="text-center mt-5 mb-4">
              Music
            </h3>
            <YouTubeVideoList :videos="random(music).slice(0, 4)" :showAdminToolsInAdminMode="false" skin="dark" />
            <div class="text-center mt-1">
              <router-link class="btn btn-ghost-dark"
                :to="{ name: 'show', params: { type: 'tv-show', id: musicShow.id } }"> More Music <i class=" fas
                fa-chevron-right ml-1" style="opacity: 0.5"></i></router-link>
            </div>
          </div>
          <div v-if="videos && news && news.length > 0">
            <h3 class="text-center mt-5 mb-4">
              News
            </h3>
            <YouTubeVideoList :videos="random(news).slice(0, 4)" :showAdminToolsInAdminMode="false" skin="dark" />
            <div class="text-center mt-1">
              <router-link class="btn btn-ghost-dark"
                :to="{ name: 'show', params: { type: 'tv-show', id: newsShow.id } }"> More News <i class=" fas
                fa-chevron-right ml-1" style="opacity: 0.5"></i></router-link>
            </div>
          </div>
          <LazyIdenticalLanguages
            class="mt-5 mb-4"
            routeName="all-media"
          />
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
      music: [],
      movies: [],
      news: [],
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
    if (!this.videos || this.videos.length === 0) this.videos = await this.getVideos({ limit: 100 })
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
        this.music = await this.getVideos({ limit: 10, tvShow: this.musicShow.id })
        this.movies = await this.getVideos({ limit: 10, tvShow: this.moviesShow.id })
      }
      if (this.talks) {
        this.newsShow = this.$store.state.shows.talks[this.$l2.code].find(
          (s) => s.title === "News"
        );
        this.news = await this.getVideos({ limit: 10, talk: this.newsShow.id })
      }
    },
    random(array, max) {
      let shuffled = Helper.shuffle(array)
      return shuffled.slice(0, max)
    },
    async getVideos({ limit = 10, tvShow = undefined, talk = undefined }) {
      try {
        let videos
        let filter = 'filter[tv_show][nnull]=1'
        if (tvShow) filter = `filter[tv_show][eq]=${tvShow}`
        if (talk) filter = `filter[talk][eq]=${talk}`

        let response = await axios.get(
          `${Config.youtubeVideosTableName(this.$l2.id)}?sort=-date&filter[l2][eq]=${this.$l2.id
          }&${filter}&filter[youtube_id][contains]=${this.randBase64(1)}&limit=${limit}&fields=channel_id,id,lesson,level,title,topic,youtube_id,tv_show,talk`
        );
        if (response.data.data && response.data.data.length > 0) videos = response.data.data
        if (!videos && !tvShow && !talk) {
          response = await axios.get(
            `${Config.youtubeVideosTableName(this.$l2.id)}?sort=-date&filter[l2][eq]=${this.$l2.id
            }&limit=${limit}&fields=channel_id,id,lesson,level,title,topic,youtube_id,tv_show,talk`
          );
          videos = response.data.data || []
        }
        if (!tvShow & !talk) videos = Helper.uniqueByValue(videos, 'tv_show')
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
</style>