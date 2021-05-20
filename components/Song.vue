<template>
  <div class="row song" :data-lrc-id="lrc.id">
    <div class="container">
      <div class="row">
        <div class="col-md-6 text-center youtube-versions-wrapper">
          <div
            class="youtube-versions p-3 rounded"
            :id="`${_uid}-lrc-${lrcIndex}-youtube`"
          >
            <YouTubeVideo
              :youtube="lrc.youtube[currentYoutubeIndex]"
              :startTime="
                lrc.matchedLines
                  ? lrc.content[lrc.matchedLines[0]].starttime
                  : 0
              "
              :lrc="lrc"
              ref="youtube"
            />
            <div class="mt-3 mb-0" v-if="lrc.youtube.length > 0">
              <button class="btn-small" @click="youtubePrev">
                <i class="fa fa-chevron-left" />
              </button>
              <b>{{ currentYoutubeIndex + 1 }}</b>
              of
              {{ lrc.youtube.length }}
              <button class="btn-small" @click="youtubeNext">
                <i class="fa fa-chevron-right" />
              </button>
            </div>
          </div>
          <div v-if="lrc.youtube.length === 0" class="bg-light p-4 text-center">
            <div>
              <button
                class="btn btn-danger"
                @click="addYouTube"
                v-if="!gettingYouTube"
              >
                Get YouTube Videos
              </button>
              <Loader v-if="gettingYouTube" />
            </div>
          </div>
        </div>
        <div class="col-md-6 lyrics-wrapper sm-mb2">
          <button
            v-if="!removed"
            class="btn-medium btn-gray"
            style="float:right"
            @click="remove"
          >
            <i class="fa fa-trash mr-2" />Delete
          </button>
          <Annotate
            tag="div"
            class="transcript-title"
            v-html="lrc.artist + '《' + lrc.title + '》'"
             :showTranslate="true"
          ></Annotate>
          <hr />
          <SyncedTranscript
            ref="transcript"
            :lines="lrc.content.filter(line => line.line.length > 0)"
            :onSeek="seekYouTube"
            :highlight="entry ? entry.simplified : false"
            :hsk="entry ? entry.hsk : 'outside'"
            collapse="true"
          />
          <span v-if="removed">
            <i class="fa fa-check ml-2 text-success" />Removed
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LRC from '@/lib/lrc'
import Helper from '@/lib/helper'
import YouTubeVideo from '@/components/YouTubeVideo'
import YouTube from '@/lib/youtube'
import Config from '@/lib/config'
import SyncedTranscript from '@/components/SyncedTranscript'
import { setInterval } from 'timers'

export default {
  components: {
    YouTubeVideo,
    SyncedTranscript
  },
  data() {
    return {
      LRC,
      Helper,
      removed: false,
      currentYoutubeIndex: 0,
      gettingYouTube: false
    }
  },
  mounted() {
    setInterval(() => {
      if (this.$refs.transcript) {
        this.$refs.transcript.currentTime = this.$refs.youtube
          ? this.$refs.youtube.currentTime()
          : 0
      }
    }, 1000)
  },
  props: {
    entry: {
      default: false
    },
    lrc: {
      type: Object
    },
    lrcIndex: {
      type: Number
    },
    collapse: {
      default: true
    }
  },
  methods: {
    seekYouTube(starttime) {
      this.$refs.youtube.seek(starttime)
    },
    remove() {
      let c = confirm('Delete this song for everyone?')
      if (c) {
        LRC.delete(this.lrc.id).then(() => {
          this.removed = true
        })
      }
    },
    youtubePrev() {
      this.currentYoutubeIndex = Math.max(this.currentYoutubeIndex - 1, 0)
    },
    youtubeNext() {
      this.currentYoutubeIndex = Math.min(
        this.currentYoutubeIndex + 1,
        this.lrc.youtube.length - 1
      )
    },

    addYouTube(e) {
      var lrc = this.lrc
      this.gettingYouTube = true
      YouTube.searchYouTubeByProxy(
        lrc.artist + ' ' + lrc.title + '',
        videoIds => {
          $.post(
            Config.lrcServer + 'lrc/createlrcyoutube',
            {
              lrc_id: lrc.id,
              youtube_ids: videoIds
            },
            result => {
              this.gettingYouTube = false
              if (result.status === 'success') {
                this.lrc.youtube = result.youtube.map(
                  youtube => youtube.youtube_id
                )
              }
            }
          )
        }
      )
    },
    deleteClick: function(e) {
      var lrc = this.lrc
      $.getJSON(Config.lrcServer + 'lrc/delete/' + lrc.id, function(result) {
        if (result.status === 'success') {
          // lrc.deleted = true; // Too slow to render in long lists!
          $(e.target).after('Success')
          $(e.target).remove()
        }
      })
    }
  }
}
</script>

<style scoped>
.song {
  padding: 2rem 0;
  margin: 0;
}

.youtube-versions-wrapper,
.youtube-versions {
  position: sticky;
  z-index: 2;
  top: 1rem;
}

.youtube-versions {
  background: white;
  margin-bottom: 2rem;
}

.youtube-versions .youtube:not(:first-child) {
  display: none;
}

@media (max-width: 768px) {
  .youtube-versions-wrapper,
  .youtube-versions {
    top: 0;
    margin-left: calc((100vw - 100%) / -2);
    width: 100vw;
  }
}

.song-caroussel {
  position: relative;
  padding: 0 2rem;
}

.song-caroussel .paginate-button {
  position: absolute;
  z-index: 1;
  height: 4rem;
  top: 3rem;
}

.song-caroussel .paginate-button.next {
  margin-right: -2.5rem;
}

.song-caroussel .paginate-button.previous {
  margin-left: -2.5rem;
}

@media (max-width: 768px) {
  .song-caroussel .paginate-button.next {
    margin-right: -1.5rem;
  }
  .song-caroussel .paginate-button.previous {
    margin-left: -1.5rem;
  }
}
</style>
