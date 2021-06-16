<template>
  <div class="youtube-videos">
    <YouTubeVideoCard
      v-for="(video, videoIndex) in videos"
      :video="video"
      :checkSaved="checkSaved"
      :checkSubs="checkSubs"
      :showSubsEditing="showSubsEditing"
      ref="youTubeVideoCard"
      :key="`youtube-video-${video.youtube_id}-${videoIndex}`"
    />
  </div>
</template>

<script>
import Helper from '@/lib/helper'
import YouTubeVideoCard from '@/components/YouTubeVideoCard'

export default {
  components: {
    YouTubeVideoCard,
  },
  data() {
    return {
      Helper,
      videosInfoKey: 0,
    }
  },
  props: {
    videos: {
      type: Array,
    },
    checkSaved: {
      default: false,
    },
    checkSubs: {
      default: false,
    },
    showSubsEditing: {
      default: false
    }
  },
  methods: {
    async addAll() {
      for(let videoIndex in this.videos) {
        // await Helper.timeout(500)
        this.$refs.youTubeVideoCard[videoIndex].getSubsAndSave()
      }
    },
    removeAll() {
      for(let videoIndex in this.videos) {
        this.$refs.youTubeVideoCard[videoIndex].remove()
      }
    },
    importSrtToAll(files) {
      for(let videoIndex in this.videos) {
        let card = this.$refs.youTubeVideoCard[videoIndex]
        for (let file of files) {
          if (card.video.title.replace(/\s(\d)\s/, ' 0$1 ').includes(file.name.replace(/[^\d]*(\d+)[^\d]*/, '$1'))) {
            card.importSrt(file)
            break
          }
        }
      }
    }
  }
}
</script>

<style lang="scss">
.youtube-videos {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -1rem;
}
</style>
