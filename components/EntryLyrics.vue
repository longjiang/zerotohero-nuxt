<template>
  <div v-if="lrcs && lrcs.length > 0">
    <!-- ANCHOR img/anchors/lyrics-bar.png -->
    <div class="container-fluid song-lyrics-bar" :data-bg-level="entry.hsk" v-cloak>
      <div class="container">
        <div class="col-sm-12 text-center">
          <strong>
            “
            <span class="simplified">{{ entry.simplified }}</span>
            <span class="traditional">{{ entry.traditional }}</span>” IN SONG LYRICS
          </strong>
        </div>
      </div>
    </div>

    <div class="container-flud lyrics-bar" v-cloak>
      <div class="songs">
        <Song
          v-for="(lrc, lrcIndex) in lrcs.slice(0, limit)"
          :entry="entry"
          :lrc="lrc"
          :lrcIndex="lrcIndex"
        />
      </div>
    </div>
    <!-- .lyrics-bar -->
  </div>
</template>

<script>
import LRC from '@/lib/lrc'
import Helper from '@/lib/helper'
import Song from '@/components/Song'

export default {
  components: {
    Song
  },
  props: {
    entry: {
      type: Object
    },
    limit: {
      default: 10
    }
  },
  data() {
    return {
      Helper,
      LRC,
      // show: false,
      lrcs: [] // matched song lyrics, pulled from another server
    }
  },
  methods: {
    showLRCs() {
      this.show = true
    }
  },
  mounted() {
    LRC.getLrcs(this.entry.simplified, lrcs => {
      for (let lrc of lrcs) {
        lrc.matchedLines = []
        for (let [index, line] of lrc.content.entries()) {
          if (line.line.includes(this.entry.simplified)) {
            lrc.matchedLines.push(index)
          }
        }
        lrc.currentYoutubeIndex = 1 // "Showing 1 of 23 videos..."
      }
      this.lrcs = lrcs
        .sort(function(a, b) {
          return (
            Object.keys(b.matchedLines).length -
            Object.keys(a.matchedLines).length
          )
        })
        .filter(lrc => lrc.youtube && lrc.youtube.length > 0)
    })
    $('.youtube iframe').remove() // Show new videos;
  }
}
</script>
<style>
.lyrics-bar {
  background: #dedede;
}
.song-lyrics-bar {
  padding: 1.5rem 0;
}
</style>
