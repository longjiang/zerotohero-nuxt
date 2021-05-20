<template>
  <div class="container main mt-5 mb-5">
    <audio v-if="drill.file" id="drill-audio">
      <source :src="drill.file.data.full_url" type="audio/mpeg" />
    </audio>
    <div v-for="(pattern, patternIndex) of this.drill.patterns" class="mb-5">
      <h5>Example:</h5>
      <div class="audio-media">
        <b-button
          @click="playAudio(pattern.model.starttime, pattern.model.endtime)"
          ><i class="fas fa-play"></i
        ></b-button>
        <div class="audio-media-body">
          <Annotate
            ><p class="lead mb-0">
              <b>{{ pattern.model.prompt }}</b
              ><span class="ml-2 mr-2">→</span
              ><span>{{ pattern.model.answer }}</span>
            </p></Annotate
          >
          <p class="translation">
            {{ pattern.model[$l1.code] }}
          </p>
        </div>
      </div>
      <div class="jumbotron pt-2 pb-2 mb-3">
        <div v-for="(item, itemIndex) in pattern.items" class="mt-4 mb-4">
          <div class="audio-media mb-2">
            <b-button @click="playItem(patternIndex, itemIndex)"
              ><i class="fas fa-play"></i
            ></b-button>
            <div class="audio-media-body">
              <Annotate
                ><strong>{{ item.prompt }}</strong></Annotate
              >
              <span
                :id="`drill-answer-${patternIndex}-${itemIndex}`"
                class="drill-answer drill-answer-hidden"
                ><span class="ml-2 mr-2">→</span
                ><Annotate
                  ><span>{{ item.answer }}</span></Annotate
                ></span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Speak from '@/components/Speak'

export default {
  props: ['drill'],
  components: {
    Speak
  },
  mounted() {
    this.audio = document.getElementById('drill-audio')
  },
  methods: {
    speak(text) {
      var utterance = new SpeechSynthesisUtterance(text)
      let speechCode = this.$l2.code === 'yue' ? 'zh-HK' : this.$l2.code
      utterance.lang = speechCode
      speechSynthesis.speak(utterance)
    },
    playItem(patternIndex, itemIndex) {
      let pattern = this.drill.patterns[patternIndex]
      let item = pattern.items[itemIndex]
      if (this.drill.file) {
        this.playAudio(item.starttime, item.endtime)
      } else {
        this.speak(item.prompt)
      }
      setTimeout(() => {
        if (!this.drill.file) this.speak(item.answer)
        $(`#drill-answer-${patternIndex}-${itemIndex}`).removeClass(
          'drill-answer-hidden'
        )
      }, 4000)
    },
    // https://stackoverflow.com/questions/9640266/convert-hhmmss-string-to-seconds-only-in-javascript
    parseTime(hms) {
      if (hms && hms.length > 0) {
        var a = hms.split(':') // split it at the colons
        // minutes are worth 60 seconds. Hours are worth 60 minutes.
        var seconds =
          a.length > 2
            ? +a[0] * 60 * 60 + +a[1] * 60 + +a[2]
            : +a[0] * 60 + +a[1]
        return seconds
      }
    },
    // https://stackoverflow.com/questions/5932412/html5-audio-how-to-play-only-a-selected-portion-of-an-audio-file-audio-sprite
    playAudio(startTime, endTime) {
      if (typeof startTime === 'string') startTime = this.parseTime(startTime)
      if (typeof endTime === 'string') endTime = this.parseTime(endTime)
      if (!startTime) startTime = 0
      if (!endTime) endTime = startTime + 10
      var segmentEnd
      console.log('playAudio', startTime, endTime)
      let timeUpdateEventListener = () => {
        if (segmentEnd && this.audio.currentTime >= segmentEnd) {
          this.audio.pause()
          this.audio.removeEventListener('timeupdate', timeUpdateEventListener)
        }
      }
      this.audio.removeEventListener('timeupdate', timeUpdateEventListener)
      this.audio.addEventListener('timeupdate', timeUpdateEventListener, false)
      segmentEnd = endTime
      this.audio.currentTime = startTime
      this.audio.play()
    }
  },
  data() {
    return {
      itemKey: 0,
      audio: undefined
    }
  }
}
</script>

<style lang="scss">
.translation {
  font-style: italic;
  color: #aaa;
}
.audio-media {
  display: flex;
  align-items: flex-start;
  .audio-media-body {
    margin-left: 1rem;
    flex: 1;
  }
}
.drill-answer {
  transition: all 1s ease-out;
  opacity: 1;
}
.drill-answer-hidden {
  transition: all 1s ease-out;
  opacity: 0;
}
</style>
