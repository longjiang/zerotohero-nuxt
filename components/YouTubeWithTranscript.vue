<template>
  <div class="container-fluid">
    <div v-if="layout === 'horizontal'" class="row">
      <div class="youtube-video-column col-md-6 sticky">
        <div
          class="youtube-video-wrapper sticky pt-3 pb-3 bg-white"
          :key="'youtube-' + youtube"
        >
          <YouTubeVideo
            ref="youtube"
            :youtube="youtube"
            :speed="speed"
            @paused="updatePaused"
          />
        </div>
      </div>
      <div class="col-md-6" :key="'transcript-' + youtube">
        <div v-if="this.l2Lines.length > 0">
          <SyncedTranscript
            ref="transcript"
            :onSeek="seekYouTube"
            :onPause="pauseYouTube"
            :lines="this.l2Lines"
            :quiz="quiz"
            :parallellines="this.l1Lines"
            :sticky="sticky"
          />
        </div>
      </div>
    </div>
    <template v-if="layout === 'vertical'">
      <div class="row video-area">
        <div style="width: 100%">
          <div class="youtube-video-wrapper">
            <YouTubeVideo
              ref="youtube"
              @paused="updatePaused"
              :speed="speed"
              :youtube="youtube"
              :starttime="starttime"
              :autoload="autoload"
              :autoplay="autoplay"
            />
          </div>
        </div>
      </div>
      <div class="row">
        <div :key="'transcript-' + youtube" class="mt-2 col-sm-12">
          <div v-if="this.l2Lines.length > 0" class="text-center">
            <SyncedTranscript
              ref="transcript"
              :onSeek="seekYouTube"
              :onPause="pauseYouTube"
              :lines="this.l2Lines"
              :parallellines="this.l1Lines"
              :single="true"
              :quiz="false"
              :highlight="highlight"
              :hsk="hsk"
              :highlight-saved-words="false"
              :startLineIndex="startLineIndex"
              :stopLineIndex="stopLineIndex"
              :sticky="sticky"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import YouTubeVideo from '@/components/YouTubeVideo'
import SyncedTranscript from '@/components/SyncedTranscript'

export default {
  props: {
    youtube: {
      type: String,
    },
    l1Lines: {
      type: Array,
    },
    l2Lines: {
      type: Array,
    },
    sticky: {
      default: false,
    },
    layout: {
      type: String,
      default: 'horizontal', // or 'vertical'
    },
    speed: {
      type: Number,
      default: 1,
    },
    highlight: {
      type: Array,
    },
    quiz: {
      default: false,
    },
    hsk: {
      default: 'outside',
    },
    autoload: {
      default: false,
    },
    autoplay: {
      default: false,
    },
    startLineIndex: {
      default: 0,
    },
    stopLineIndex: {
      default: -1,
    },
  },
  data() {
    return {
      paused: true,
      starttime: this.l2Lines.length > 0
        ? this.l2Lines[this.startLineIndex].starttime
        : 0
    }
  },
  components: {
    YouTubeVideo,
    SyncedTranscript,
  },
  methods: {
    updatePaused(paused) {
      if (paused !== this.paused) {
        this.paused = paused
        this.$emit('paused', paused)
      }
    },
    previousLine() {
      this.$refs.transcript.previousLine()
    },
    nextLine() {
      this.$refs.transcript.nextLine()
    },
    rewind() {
      this.seekYouTube(this.l2Lines[this.startLineIndex].starttime)
    },
    pause() {
      this.$refs.youtube.pause()
    },
    play() {
      this.$refs.youtube.play()
    },
    getHighlightStartTime(term) {
      let matchedLines = this.l2Lines.filter((line) => line.line.includes(term))
      if (matchedLines.length > 0) {
        return matchedLines[0].starttime
      }
    },
    getHighlightLineIndex(term) {
      return this.l2Lines.findIndex((line) => line.line.includes(term))
    },
    seekYouTube(starttime) {
      if (this.$refs.youtube.player) {
        this.$refs.youtube.seek(starttime)
      } else {
        this.starttime = starttime
      }
    },
    pauseYouTube() {
      this.$refs.youtube.pause()
    },
    playYouTube() {
      this.$refs.youtube.loadYouTubeiFrame()
    },
    togglePaused() {
      this.$refs.youtube.togglePaused()
    },
  },
  watch: {
    startLineIndex() {
      if (this.$refs.youtube.player && this.$refs.youtube.player.seekTo) {
        this.rewind()
      }
    },
  },
  mounted() {
    setInterval(() => {
      if (this.$refs.transcript) {
        this.$refs.transcript.currentTime = this.$refs.youtube
          ? this.$refs.youtube.currentTime()
          : 0
      }
    }, 100)
  },
}
</script>

<style scoped>
.youtube-video-wrapper {
  max-width: calc((100vh - 8rem) * 16 / 9);
  margin: 0 auto;
}
</style>