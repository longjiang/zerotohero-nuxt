<template>
  <div class="container main pt-5 mb-5">
    <audio v-if="drill.file" id="drill-audio">
      <source :src="drill.file.data.full_url" type="audio/mpeg" />
    </audio>
    <div
      v-for="(pattern, patternIndex) of this.drill.patterns"
      class="mb-5"
      :key="`drill-pattern-${patternIndex}`"
    >
      <h5>Example:</h5>
      <div class="audio-media">
        <b-button
          @click="playAudio(pattern.model.starttime, pattern.model.endtime)"
          ><i class="fas fa-play"></i
        ></b-button>
        <div class="audio-media-body">
          <p class="lead mb-0">
            <b><TokenizedText :text="pattern.model.prompt" /></b
            ><span class="ml-2 mr-2">→</span
            ><span><TokenizedText :text="pattern.model.answer" /></span>
          </p>
          <p class="translation">
            {{ pattern.model[$l1.code] }}
          </p>
        </div>
      </div>
      <div class="jumbotron bg-accent pt-2 pb-2 mb-3">
        <div
          v-for="(item, itemIndex) in pattern.items"
          class="mt-4 mb-4"
          :key="`drill-item-${patternIndex}-${itemIndex}`"
        >
          <div class="audio-media mb-2">
            <b-button @click="playItem(patternIndex, itemIndex)"
              ><i class="fas fa-play"></i
            ></b-button>
            <div class="audio-media-body">
              <strong><TokenizedText :text="item.prompt" /></strong>
              <span
                :id="`drill-answer-${patternIndex}-${itemIndex}`"
                class="drill-answer drill-answer-hidden"
                ><span class="ml-2 mr-2">→</span
                >
                <TokenizedText :text="item.answer" /></span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { SpeechSingleton } from "../lib/utils";

export default {
  props: ["drill"],
  data() {
    return {
      itemKey: 0,
      audio: undefined,
    };
  },
  mounted() {
    this.audio = document.getElementById("drill-audio");
  },
  methods: {
    speak(text) {
      SpeechSingleton.instance.speak({text: text, l2: this.$l2});
    },
    playItem(patternIndex, itemIndex) {
      let pattern = this.drill.patterns[patternIndex];
      let item = pattern.items[itemIndex];
      if (this.drill.file) {
        this.playAudio(item.starttime, item.endtime);
      } else {
        this.speak(item.prompt);
      }
      setTimeout(() => {
        if (!this.drill.file) this.speak(item.answer);
        $(`#drill-answer-${patternIndex}-${itemIndex}`).removeClass(
          "drill-answer-hidden"
        );
      }, 4000);
    },
    // https://stackoverflow.com/questions/9640266/convert-hhmmss-string-to-seconds-only-in-javascript
    parseTime(hms) {
      if (hms && hms.length > 0) {
        var a = hms.split(":"); // split it at the colons
        // minutes are worth 60 seconds. Hours are worth 60 minutes.
        var seconds =
          a.length > 2
            ? +a[0] * 60 * 60 + +a[1] * 60 + +a[2]
            : +a[0] * 60 + +a[1];
        return seconds;
      }
    },
    // https://stackoverflow.com/questions/5932412/html5-audio-how-to-play-only-a-selected-portion-of-an-audio-file-audio-sprite
    playAudio(startTime, endTime) {
      if (typeof startTime === "string") startTime = this.parseTime(startTime);
      if (typeof endTime === "string") endTime = this.parseTime(endTime);
      if (!startTime) startTime = 0;
      if (!endTime) endTime = startTime + 10;
      var segmentEnd;
      let timeUpdateEventListener = () => {
        if (segmentEnd && this.audio.currentTime >= segmentEnd) {
          this.audio.pause();
          this.audio.removeEventListener("timeupdate", timeUpdateEventListener);
        }
      };
      this.audio.removeEventListener("timeupdate", timeUpdateEventListener);
      this.audio.addEventListener("timeupdate", timeUpdateEventListener, false);
      segmentEnd = endTime;
      this.audio.currentTime = startTime;
      this.audio.play();
    },
  },
};
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
