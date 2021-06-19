<router>
  {
    path: '/:l1/:l2/youtube/playlist/:playlist_id?',
    props: true
  }
</router>
<template>
  <div class="youtube-browse container mt-5 mb-5 main">
    <div class="row">
      <div class="col-sm-12">
        <h3 class="text-center">Playlist: {{ playlist_id }}</h3>
        <YouTubeVideoList
          :videos="videos.filter((video) => video.title !== 'Private video')"
          :checkSubs="true"
          ref="youtubeVideoList"
        />
      </div>
    </div>
  </div>
</template>

<script>
import YouTubeVideoList from '@/components/YouTubeVideoList'
import YouTube from '@/lib/youtube'

export default {
  components: {
    YouTubeVideoList,
  },
  props: {
    playlist_id: {
      type: String,
    },
  },
  data() {
    return {
      title: undefined,
      videos: [],
      checkSaved: false,
      checkShows: false,
    }
  },
  mounted() {
    this.update()
  },
  methods: {
    async update() {
      this.title = undefined
      this.videos = []
      let videos = await YouTube.playlistByApi(this.playlist_id)
      if (videos && videos.length > 0) {
        if (this.checkShows)
          videos = await YouTube.checkShows(
            videos,
            this.$l2.id,
            this.$adminMode
          )
        this.videos = videos
      }
    },
  },
  computed: {

    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  watch: {
    playlist_id() {
      if (this.$route.name === 'youtube-playlist') {
        this.update()
      }
    },
  },
}
</script>
