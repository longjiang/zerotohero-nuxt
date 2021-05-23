<template>
  <div>
    <YouTubeVideoList ref="youTubeVideoList" :videos="videos" :checkSubs="true" :updateVideos="updateVideos" :checkSaved="checkSaved" />
    <div class="mt-4 text-center">
      <router-link v-if="start > 9" :to="`/${$l1.code}/${$l2.code}/youtube/search/${encodeURIComponent(term)}/${Number(start) - 10}`" class="btn btn-default mr-2">Previous</router-link>
      <router-link :to="`/${$l1.code}/${$l2.code}/youtube/search/${encodeURIComponent(term)}/${Number(start) + 10}`" class="btn btn-default">Next</router-link>
    </div>
  </div>
</template>

<script>
import YouTube from '@/lib/youtube'
import YouTubeVideoList from '@/components/YouTubeVideoList'

export default {
  components: {
    YouTubeVideoList
  },
  props: {
    term: {
      type: String
    },
    start: {
      default: 0
    },
    captions: {
      type: String,
      default: 'all' // or 'nocaptions' or 'all'
    },
    checkSubs: {
      default: false
    },
    checkSaved: {
      default: false
    }
  },
  data() {
    return {
      videos: [],
      updateVideos: 0
    }
  },
  mounted() {
    this.bindKeys()
    this.updateURL()
  },
  unmounted() {
    this.unbindKeys()
  },
  activated() {
    this.bindKeys()
  },
  deactivated() {
    this.unbindKeys()
  },
  watch: {
    term() {
      this.updateURL()
    },
    start() {
      this.updateURL()
    }
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
  },
  methods: {
    prevPage() {
      this.$router.push({path: `/${this.$l1.code}/${this.$l2.code}/youtube/search/${encodeURIComponent(this.term)}/${Number(this.start) - 10}` })
    },
    nextPage() {
      this.$router.push({path: `/${this.$l1.code}/${this.$l2.code}/youtube/search/${encodeURIComponent(this.term)}/${Number(this.start) + 10}`})
    },
    unbindKeys() {
      window.onkeydown = null
    },
    bindKeys() {
      window.onkeydown = (e) => {
        if (e.target.tagName.toUpperCase() !== 'INPUT') {
          // left = 37
          if (e.keyCode == 37) {
            this.prevPage()
            return false
          }
          // right = 39
          if (e.keyCode == 39) {
            this.nextPage()
            return false
          }
        }
      }
  },
    async updateURL() {
      this.videos = []
      let options = {
        term: this.term,
        start: this.start || 0,
        lang: this.$l2.code,
      }
      if (this.captions === 'nocaptions') options.captions = false
      if (this.captions === 'captions') options.captions = true
      let videos = await YouTube.searchByGoogle(options)
      this.videos = videos.map(video => {
        video.youtube_id = video.id
        video.id = undefined
        return video
      })
      this.updateVideos++
    },
    addAll() {
      this.$refs.youTubeVideoList.addAll()
    }
  }
}
</script>