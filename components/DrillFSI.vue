<template>
  <div class="container main pt-5 mb-5">
    <audio id="drill-audio">
      <source :src="drill.file" type="audio/mpeg">
    </audio>
    <div v-for="(pattern, patternIndex) in drill.patterns">
      <div class="audio-media">
        <b-button @click="playAudio(pattern.model.starttime, pattern.model.endtime)"><i class="fas fa-play"></i></b-button>
        <div class="audio-media-body">
          <Annotate><p class="lead mb-0">
            {{ pattern.model[$l2.code] }}
          </p></Annotate>
          <p class="translation">
            {{ pattern.model[$l1.code] }}
          </p>
        </div>
      </div>
      <div
        v-for="(part, partIndex) in pattern.parts"
        class="jumbotron p-4 mb-3"
      >
        <div v-for="(item, itemIndex) in part" class="mt-4 mb-4">
          <div class="audio-media mb-2">
            <b-button @click="playItem(patternIndex, partIndex, itemIndex)"><i class="fas fa-play"></i></b-button>
            <div class="audio-media-body">
              <Annotate tag="div"><strong>{{ item.prompt }}</strong></Annotate>
              <Annotate :id="`drill-answer-${patternIndex}-${partIndex}-${itemIndex}`" class="drill-answer drill-answer-hidden"><span>{{ item.answer }}</span></Annotate>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//:key="`item-${patternIndex}-${partIndex}-${itemIndex}-${itemKey}`"
export default {
  mounted() {
    this.audio = document.getElementById('drill-audio');
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
    playItem(patternIndex, partIndex, itemIndex) {
      let pattern = this.drill.patterns[patternIndex]
      let part = pattern.parts[partIndex]
      let item = part[itemIndex]
      item.show = false
      this.playAudio(item.starttime, itemIndex < part.length - 1 ? part[itemIndex + 1].starttime : partIndex < pattern.parts.length - 1 ? pattern.parts[partIndex + 1][0].starttime : item.endtime)

      setTimeout(() => {
        $(`#drill-answer-${patternIndex}-${partIndex}-${itemIndex}`).removeClass('drill-answer-hidden')
      }, 4000)
    },
    // https://stackoverflow.com/questions/9640266/convert-hhmmss-string-to-seconds-only-in-javascript
    parseTime(hms) {
      if (hms && hms.length > 0) {
        var a = hms.split(':'); // split it at the colons
        // minutes are worth 60 seconds. Hours are worth 60 minutes.
        var seconds = a.length > 2 ? (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]) : (+a[0]) * 60 + (+a[1])
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
      let timeUpdateEventListener = () => {
        if (segmentEnd && this.audio.currentTime >= segmentEnd) {
          this.audio.pause()
          this.audio.removeEventListener('timeupdate', timeUpdateEventListener)
        }
      }
      this.audio.addEventListener('timeupdate', timeUpdateEventListener, false)
      segmentEnd = endTime
      this.audio.currentTime = startTime
      this.audio.play()
    }
  },
  data() {
    return {
      itemKey: 0,
      audio: undefined,
      drill: {
        file: 'https://www.livelingua.com/fsi/German/Basic/Volume%201/FSI%20-%20German%20Basic%20Course%20-%20Volume%201%20-%20Unit%2001%201.2.mp3',
        patterns: [
          {
            model: {
              starttime: '6:07',
              endtime: '6:10',
              en: 'The airport is there.',
              de: 'Der Flughafen ist dort.'
            },
            parts: [
              [
                {
                  starttime: '6:13',
                  prompt: 'Bahnhof',
                  answer: 'Der Bahnhof ist dort.'
                },
                {
                  starttime: '6:18',
                  prompt: 'Kaffee',
                  answer: 'Der Kaffee ist dort.'
                },
                {
                  starttime: '6:22',
                  prompt: 'Tee',
                  answer: 'Der Tee ist dort.'
                },
                {
                  starttime: '6:27',
                  prompt: 'Wein',
                  answer: 'Der Wein ist dort.'
                }
              ],
              [
                {
                  starttime: '6:32',
                  prompt: 'Restaurant',
                  answer: 'Das Restaurant ist dort.'
                },
                {
                  starttime: '6:39',
                  prompt: 'Bier',
                  answer: 'Das Bier ist dort.'
                },
                {
                  starttime: '6:44',
                  prompt: 'Wasser',
                  answer: 'Das Wasser ist dort.'
                },
                {
                  starttime: '6:49',
                  prompt: 'Hotel',
                  answer: 'Das Hotel ist dort.'
                },
                {
                  starttime: '6:55',
                  prompt: 'Café',
                  answer: 'Das Café ist dort.'
                }
              ],
              [
                {
                  starttime: '7:01',
                  prompt: 'Bank',
                  answer: 'Die Bank ist dort.'
                },
                {
                  starttime: '7:08',
                  prompt: 'Milch',
                  answer: 'Die Milch ist dort.'
                },
                {
                  starttime: '7:13',
                  prompt: 'Botschaft',
                  answer: 'Die Botschaft ist dort.'
                }
              ],
              [
                {
                  starttime: '7:19',
                  prompt: 'Streichhölzer',
                  answer: 'Die Streichhölzer sind dort.'
                },
                {
                  starttime: '7:26',
                  prompt: 'Zigarren',
                  answer: 'Die Zigarren sind dort.'
                }
              ],
              [
                {
                  starttime: '7:32',
                  prompt: 'Bahnhof',
                  answer: 'Der Bahnhof ist dort.'
                },
                {
                  starttime: '7:39',
                  prompt: 'Hotel',
                  answer: 'Das Hotel ist dort.'
                },
                {
                  starttime: '7:44',
                  prompt: 'Tee',
                  answer: 'Der Tee ist dort.'
                },
                {
                  starttime: '7:49',
                  prompt: 'Milch',
                  answer: 'Die Milch ist dort.'
                },
                {
                  starttime: '7:53',
                  prompt: 'Kaffee',
                  answer: 'Der Kaffee ist dort.'
                },
                {
                  starttime: '7:57',
                  prompt: 'Restaurant',
                  answer: 'Das Restaurant ist dort.'
                },
                {
                  starttime: '8:02',
                  prompt: 'Streichhölzer',
                  answer: 'Die Streichhölzer sind dort.'
                },
                {
                  starttime: '8:08',
                  prompt: 'Botschaft',
                  answer: 'Die Botschaft ist dort.'
                },
                {
                  starttime: '8:12',
                  prompt: 'Flughafen',
                  answer: 'Der Flughafen ist dort.'
                },
                {
                  starttime: '8:18',
                  prompt: 'Bier',
                  answer: 'Das Bier ist dort.'
                },
                {
                  starttime: '8:22',
                  prompt: 'Wein',
                  answer: 'Der Wein ist dort.'
                },
                {
                  starttime: '8:27',
                  prompt: 'Wasser',
                  answer: 'Das Wasser ist dort.'
                },
                {
                  starttime: '8:31',
                  prompt: 'Zigarren',
                  answer: 'Die Zigarren sind dort.'
                },
                {
                  starttime: '8:36',
                  endtime: '8:41',
                  prompt: 'Café',
                  answer: 'Das Café ist dort.'
                }
              ]
            ]
          }
        ]
      }
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
