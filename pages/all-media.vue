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
          <div v-if="videos && videos.length > 0">
            <h3 class="text-center mt-3 mb-4">
              New Arrivals
            </h3>
            <YouTubeVideoList :videos="random(videos).slice(0, 8)" :showAdminToolsInAdminMode="false" skin="dark" />
            <div class="text-center mt-1">
              <router-link class="btn btn-ghost-dark" :to="{ name: 'youtube-browse' }" > More Videos <i class=" fas
                fa-chevron-right ml-1" style="opacity: 0.5"></i></router-link>
            </div>
          </div>
          <div v-if="videos && tvShows && tvShows.length > 0">
            <h3 class="text-center mt-5 mb-4">
              TV Shows
            </h3>
            <ShowList :shows="random(tvShows, 6)" type="tvShows" :key="`tv-shows`" />
            <div class="text-center mt-1">
              <router-link class="btn btn-ghost-dark" :to="{ name: 'tv-shows' }" > More TV Shows <i class=" fas
                fa-chevron-right ml-1" style="opacity: 0.5"></i></router-link>
            </div>
          </div>
          <div v-if="videos && talks && talks.length > 0">
            <h3 class="text-center mt-5 mb-4">
              YouTube Channels
            </h3>
            <ShowList :shows="random(talks, 6)" type="talks" :key="`tv-shows`" />
            <div class="text-center mt-1">
              <router-link class="btn btn-ghost-dark" :to="{ name: 'talks' }" > More YouTube Channels <i class=" fas
                fa-chevron-right ml-1" style="opacity: 0.5"></i></router-link>
            </div>
          </div>
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
      talks: undefined
    };
  },
  async fetch() {
    this.tvShows = this.$store.state.shows['tvShows'][this.$l2.code]
    this.talks = this.$store.state.shows['talks'][this.$l2.code]
  },
  async mounted() {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
    if (!this.videos || this.videos.length === 0) this.videos = await this.getVideos(50)
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
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
  methods: {
    loadShows() {
      this.tvShows = this.$store.state.shows['tvShows'][this.$l2.code]
      this.talks = this.$store.state.shows['talks'][this.$l2.code]
    },
    random(array, max) {
      let shuffled = Helper.shuffle(array)
      return shuffled.slice(0, max)
    },
    async getVideos(limit) {
      try {
        let videos
        let response = await axios.get(
          `${Config.youtubeVideosTableName(this.$l2.id)}?sort=-date&filter[l2][eq]=${this.$l2.id
          }&filter[tv_show][nnull]=1&filter[youtube_id][contains]=${this.randBase64(1)}&limit=${limit}&fields=channel_id,id,lesson,level,title,topic,youtube_id,tv_show,talk`
        );
        if (response.data.data && response.data.data.length > 0) videos = response.data.data
        if (!videos) {
          response = await axios.get(
            `${Config.youtubeVideosTableName(this.$l2.id)}?sort=-date&filter[l2][eq]=${this.$l2.id
            }&limit=${limit}&fields=channel_id,id,lesson,level,title,topic,youtube_id,tv_show,talk`
          );
          videos = response.data.data || []
        }
        return Helper.uniqueByValue(videos, 'tv_show')
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