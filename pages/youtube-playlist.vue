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
        <div>
          <b-button
            v-if="$settings.adminMode && !checkSaved"
            class="btn btn-small mt-2 ml-3"
            @click="checkSaved = true"
            ><i class="fas fa-question mr-2"></i>Check Saved</b-button
          >
          <b-button
            v-if="$settings.adminMode && checkSaved"
            class="btn btn-small mt-2 ml-3"
            @click="checkSaved = false"
            ><i class="fas fa-question mr-2"></i>Uncheck Saved</b-button
          >
          <b-button
            v-if="$settings.adminMode && checkSaved"
            class="btn btn-small mt-2"
            @click="addAll()"
            ><i class="fas fa-plus mr-2"></i>Add All</b-button
          >
          <b-button
            v-if="$settings.adminMode"
            class="btn btn-small bg-danger text-white mt-2 ml-2"
            @click="removeAll()"
            ><i class="fas fa-trash mr-2"></i>Remove All</b-button
          >

          <drop
            v-if="$settings.adminMode"
            @drop="handleDrop"
            :class="{
              over: over,
              'subs-drop': true,
              drop: true,
              'ml-1': true,
              'text-dark': true,
              btn: true,
              'btn-light': true,
            }"
            :key="`drop-${playlist_id}`"
            @dragover="over = true"
            @dragleave="over = false"
            >Drop Subs Here</drop
          >
        </div>
        <YouTubeVideoList
          :videos="videos.filter((video) => video.title !== 'Private video')"
          :checkSubs="true"
          :checkSaved="checkSaved"
          ref="youtubeVideoList"
        />
      </div>
    </div>
  </div>
</template>

<script>
import YouTubeNav from '@/components/YouTubeNav'
import YouTubeVideoList from '@/components/YouTubeVideoList'
import YouTube from '@/lib/youtube'
import { Drag, Drop } from 'vue-drag-drop'

export default {
  components: {
    YouTubeNav,
    YouTubeVideoList,
    Drag,
    Drop,
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
      over: false,
    }
  },
  mounted() {
    this.update()
  },
  methods: {
    handleDrop(data, event) {
      event.preventDefault()
      let files = event.dataTransfer.files
      this.$refs.youtubeVideoList.importSrtToAll(files)
    },
    addAll() {
      this.$refs.youtubeVideoList.addAll()
    },
    removeAll() {
      this.$refs.youtubeVideoList.removeAll()
    },
    async update() {
      this.title = undefined
      this.videos = []
      let videos = await YouTube.playlistByApi(this.playlist_id)
      if (videos && videos.length > 0) {
        if (this.checkShows)
          videos = await YouTube.checkShows(
            videos,
            this.$l2.id,
            this.$settings.adminMode
          )
        this.videos = videos
      }
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
