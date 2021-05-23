<router>
  {
    path: '/:l1/:l2/youtube/view/:args?/:lesson?',
    props: true,
    meta: {
      title: 'YouTube Reader | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Watch YouTube videos and study the subtitles.'
        }
      ]
    }
  }
</router>
<template>
  <div class="youtube-view main pt-3 pb-5">
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <SimpleSearch
            class="mb-5"
            :placeholder="$t('Search YouTube', { l2: $l2.name })"
            buttonText="Search"
            :action="
              (url) => {
                this.$router.push({
                  path: `/${$l1.code}/${
                    $l2.code
                  }/youtube/search/${encodeURIComponent(url)}`,
                })
              }
            "
            ref="search"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <h5 :key="title">
            <Annotate :showTranslate="true">
              <span>{{ title }}</span>
            </Annotate>
          </h5>
          <div>
            <template v-if="!loading && (hasSubtitles || $settings.adminMode)">
              <b-button v-if="!saved" @click="save"
                ><i class="fas fa-plus mr-2"></i>Add to Library</b-button
              >
              <b-button v-else variant="success">
                <i class="fa fa-check mr-2"></i>Added
              </b-button>
            </template>
            <b-dropdown
              id="dropdown-1"
              v-if="saved"
              :text="saved.topic ? topics[saved.topic] : 'Topic'"
              :variant="saved.topic ? 'success' : undefined"
              class="ml-1"
            >
              <b-dropdown-item
                v-for="(title, slug) in topics"
                :key="`change-topic-item-${slug}`"
                @click="changeTopic(slug)"
                >{{ title }}</b-dropdown-item
              >
            </b-dropdown>
            <template v-if="saved && !saved.lesson">
              <b-dropdown
                id="dropdown-1"
                :text="saved.level ? levels[saved.level] : 'Level'"
                :variant="saved.level ? 'success' : undefined"
                class="ml-1"
              >
                <b-dropdown-item
                  v-for="(title, slug) in levels"
                  :key="`change-level-item-${slug}`"
                  @click="changeLevel(slug)"
                  >{{ title }}</b-dropdown-item
                >
              </b-dropdown>

              <b-button
                v-if="$settings.adminMode"
                variant="danger"
                @click="remove"
                class="ml-1"
                ><i class="fas fa-trash-alt"></i
              ></b-button>

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
                :key="`drop-${transcriptKey}`"
                @dragover="over = true"
                @dragleave="over = false"
                >Drop Subs Here</drop
              >
            </template>
          </div>
          <div v-if="$settings.adminMode && saved" class="mt-2">
            First line starts at
            <input
              v-model.lazy="firstLineTime"
              type="text"
              placeholder="0"
              class="d-inline-block ml-1"
              style="width: 4rem"
            />
            <b-button v-if="!subsUpdated" @click="updateSubs" class="ml-2"
              ><i class="fa fa-save mr-2"></i>Update Subs</b-button
            >
            <b-button v-else variant="success" class="ml-2">
              <i class="fa fa-check mr-2"></i>Updated
            </b-button>
          </div>
          <hr class="mt-3" />
          <YouTubeChannelCard
            v-if="channel"
            :channel="channel"
            :key="`channel-${channel.id}`"
            class="mb-4 d-inline-block"
          />
        </div>
      </div>
    </div>
    <div v-if="loading" class="text-center">
      <Loader :sticky="true" />
    </div>
    <YouTubeWithTranscript
      v-if="!loading"
      :youtube="args"
      ref="youtube"
      :l2Lines="this.l2Lines"
      :l1Lines="this.l1Lines"
      :quiz="true"
      :key="`transcript-${args}-${transcriptKey}`"
      :speed="speed"
      @paused="updatePaused"
    />
    <div class="play-pause-wrapper">
      <span
        class="speed shadow btn-secondary d-inline-block text-center"
        @click="speed = speed === 1 ? 0.75 : speed === 0.75 ? 0.5 : 1"
      >
        <i v-if="speed === 1" class="fas fa-tachometer-alt"></i
        ><span v-else style="font-size: 0.8em">{{ speed }}x</span>
      </span>
      <span
        class="play-pause shadow btn-primary d-inline-block text-center"
        @click="togglePaused"
      >
        <i v-if="paused" class="fas fa-play"></i
        ><i v-else class="fas fa-pause"></i>
      </span>
    </div>
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-12 p-5" id="comments">
          <h4 class="mt-5 mb-4">
            {{ $t('Comments') }}
          </h4>
          <div class="comments">
            <Disqus
              shortname="zero-to-hero"
              :identifier="`youtube-view-${args}`"
              :url="`https://www.zerotohero.ca//${$l1.code}/${$l2.code}/youtube/view/${args}`"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import YouTubeWithTranscript from '@/components/YouTubeWithTranscript'
import YouTubeChannelCard from '@/components/YouTubeChannelCard'
import SimpleSearch from '@/components/SimpleSearch'
import YouTubeSearchResults from '@/components/YouTubeSearchResults'
import YouTube from '@/lib/youtube'
import Helper from '@/lib/helper'
import Config from '@/lib/config'
import { Drag, Drop } from 'vue-drag-drop'
import { parseSync } from 'subtitle'

export default {
  components: {
    YouTubeSearchResults,
    SimpleSearch,
    YouTubeChannelCard,
    YouTubeWithTranscript,
    Drag,
    Drop,
  },
  props: {
    args: {
      type: String,
    },
    lesson: {
      default: false,
    },
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
  watch: {
    async args() {
      this.mountOrUpdate()
    },
    firstLineTime() {
      if (this.l2Lines.length > 0) {
        let subsShift =
          Number(this.firstLineTime) - Number(this.l2Lines[0].starttime)
        if (subsShift !== 0) {
          for (let line of this.l2Lines) {
            line.starttime = Number(line.starttime) + subsShift
          }
        }
        this.transcriptKey++
      }
    },
  },
  data() {
    return {
      title: undefined,
      channel: undefined,
      l2Locale: undefined,
      saved: undefined,
      loading: true,
      hasSubtitles: false,
      levels: Helper.levels(this.$l2),
      topics: Helper.topics,
      l1Lines: [],
      l2Lines: [],
      transcriptKey: 0,
      firstLineTime: 0,
      subsUpdated: false,
      over: false,
      paused: false,
      speed: 1,
    }
  },
  methods: {
    updatePaused(paused) {
      if (paused !== this.paused) {
        this.paused = paused
      }
    },
    handleDrop(data, event) {
      event.preventDefault()
      let file = event.dataTransfer.files[0]
      let reader = new FileReader()
      reader.readAsText(file)
      reader.onload = (event) => {
        let srt = event.target.result
        this.l2Lines = parseSync(srt).map((cue) => {
          return {
            starttime: cue.data.start / 1000,
            line: cue.data.text,
          }
        })
        console.log('loaded')
        this.firstLineTime = this.l2_lines[0].starttime
        this.hasSubtitles = true
        this.transcriptKey++
      }
    },
    async mountOrUpdate() {
      this.l2LinesUnshifted = []
      this.l2Lines = []
      this.firstLineTime = 0
      this.subsUpdated = false
      this.$refs.search.url = `https://www.youtube.com/watch?v=${this.args}`
      await this.getSaved()
      if (!this.saved || !this.saved.channel_id) {
        await this.getVideoDetails()
      } else {
        this.title = this.saved.title
      }
      await this.getTranscript()
      if (this.l2Lines.length > 0) {
        this.firstLineTime = this.l2Lines[0].starttime
      }
      if (this.saved && !this.saved.channel_id) {
        this.addChannelID()
      }
      document.title = `${this.title}`
    },
    wordSaved(word) {
      let saved = false
      if (word) {
        saved = this.$store.getters['savedWords/has']({
          id: word.id,
          l2: this.$l2.code,
        })
      }
      return saved
    },
    async allForms(word) {
      let wordForms = (await (await this.$getDictionary()).wordForms(word)) || []
      wordForms = wordForms.filter((form) => form !== '')
      wordForms = [word.bare.toLowerCase()].concat(
        wordForms.map((form) => form.form.replace(/'/g, ''))
      )
      wordForms = Helper.unique(wordForms).filter(
        (form) => form && form !== '' && form !== '-'
      )
      return wordForms
    },
    async saveWords() {
      let words = await (await this.$getDictionary()).lookupByLesson(
        this.saved.level,
        this.saved.lesson
      )
      for (let word of words) {
        if (word && !this.wordSaved(word)) {
          let wordForms = await this.allForms(word)
          this.$store.dispatch('savedWords/add', {
            word: word,
            wordForms: wordForms,
            l2: this.$l2.code,
          })
        }
      }
    },
    async getVideoDetails() {
      let video = await YouTube.videoByApi(this.args)
      if (video) {
        this.channel = video.channel
        this.title = video.title
      }
    },
    async getL2Transcript() {
      const promises = []
      let locales = [this.$l2.code]
      if (this.$l2.locales) {
        locales = locales.concat(this.$l2.locales)
      }

      await Helper.scrape(
        `https://www.youtube.com/api/timedtext?v=${this.args}&type=list`
      ).then(($html) => {
        for (let track of $html.find('track')) {
          let locale = $(track).attr('lang_code')
          if (locales.includes(locale)) {
            this.l2Locale = locale
          }
        }
      })

      if (this.l2Locale) {
        await Helper.scrape(
          `https://www.youtube.com/api/timedtext?v=${this.args}&lang=${this.l2Locale}&fmt=srv3`
        ).then(($html) => {
          if ($html) {
            let lines = []
            for (let p of $html.find('p')) {
              let line = {
                line: $(p).text(),
                starttime: parseInt($(p).attr('t')) / 1000,
              }
              lines.push(line)
            }
            this.l2Lines = lines.filter((line) => line.line.trim() !== '')
          }
        })
      }
    },
    async save() {
      let response = await $.post(`${Config.wiki}items/youtube_videos`, {
        youtube_id: this.args,
        channel_id: this.channel ? this.channel.id : '',
        title: this.title,
        l2: this.$l2.id,
        subs_l2: JSON.stringify(this.l2Lines),
      })
      if (response) {
        this.saved = response.data
      }
    },
    async getL1Transcript() {
      await Helper.scrape(
        `https://www.youtube.com/api/timedtext?v=${this.args}&lang=${this.l2Locale}&fmt=srv3&tlang=${this.$l1.code}`,
        ($html) => {
          for (let p of $html.find('p')) {
            let line = {
              line: $(p).text(),
              starttime: parseInt($(p).attr('t')) / 1000,
            }
            this.l1Lines.push(line)
          }
        }
      )
      this.hasSubtitles = true
    },
    async getTranscript() {
      this.l1Lines = []
      let l2Subs = []
      if (this.saved) {
        let savedSubs = JSON.parse(this.saved.subs_l2)
        if (savedSubs) {
          l2Subs = savedSubs.filter(
            (line) => line.starttime
          )
        }
      }
      this.l2Lines = l2Subs
      this.hasSubtitles = false
      this.loading = true
      if (this.l2Lines.length === 0) {
        await this.getL2Transcript()
      }
      if (this.l2Lines.length > 0) {
        await this.getL1Transcript()
        this.hasSubtitles = true
      }
      this.loading = false
    },
    async addChannelID() {
      if (this.channel && this.channel.id) {
        let channelId = this.channel.id
        let response = await $.ajax({
          url: `${Config.wiki}items/youtube_videos/${this.saved.id}`,
          data: JSON.stringify({ channel_id: channelId }),
          type: 'PATCH',
          contentType: 'application/json',
          xhr: function () {
            return window.XMLHttpRequest == null ||
              new window.XMLHttpRequest().addEventListener == null
              ? new window.ActiveXObject('Microsoft.XMLHTTP')
              : $.ajaxSettings.xhr()
          },
        })
        if (response && response.data) {
          this.saved = response.data
        }
      }
    },
    async updateSubs() {
      let response = await $.ajax({
        url: `${Config.wiki}items/youtube_videos/${this.saved.id}`,
        data: JSON.stringify({ subs_l2: JSON.stringify(this.l2Lines) }),
        type: 'PATCH',
        contentType: 'application/json',
        xhr: function () {
          return window.XMLHttpRequest == null ||
            new window.XMLHttpRequest().addEventListener == null
            ? new window.ActiveXObject('Microsoft.XMLHTTP')
            : $.ajaxSettings.xhr()
        },
      })
      if (response && response.data) {
        this.subsUpdated = true
      }
    },
    async getSaved() {
      this.saved = undefined
      let response = await $.getJSON(
        `${Config.wiki}items/youtube_videos?filter[youtube_id][eq]=${
          this.args
        }&filter[l2][eq]=${
          this.$l2.id
        }&fields=id,youtube_id,channel_id,l2,title,level,topic,lesson,subs_l2&timestamp=${
          this.$settings.adminMode ? Date.now() : 0
        }`
      )
      if (response && response.data && response.data.length > 0) {
        this.saved = response.data[0]
        if (this.lesson) {
          this.saveWords()
        }
      }
    },
    async changeLevel(slug) {
      let response = await $.ajax({
        url: `${Config.wiki}items/youtube_videos/${this.saved.id}`,
        data: JSON.stringify({ level: slug }),
        type: 'PATCH',
        contentType: 'application/json',
        xhr: function () {
          return window.XMLHttpRequest == null ||
            new window.XMLHttpRequest().addEventListener == null
            ? new window.ActiveXObject('Microsoft.XMLHTTP')
            : $.ajaxSettings.xhr()
        },
      })
      if (response && response.data) {
        this.saved = response.data
      }
    },
    async changeTopic(slug) {
      let response = await $.ajax({
        url: `${Config.wiki}items/youtube_videos/${this.saved.id}`,
        data: JSON.stringify({ topic: slug }),
        type: 'PATCH',
        contentType: 'application/json',
        xhr: function () {
          return window.XMLHttpRequest == null ||
            new window.XMLHttpRequest().addEventListener == null
            ? new window.ActiveXObject('Microsoft.XMLHTTP')
            : $.ajaxSettings.xhr()
        },
      })
      if (response && response.data) {
        this.saved = response.data
      }
    },
    async remove() {
      let response = await $.ajax({
        url: `${Config.wiki}items/youtube_videos/${this.saved.id}`,
        type: 'DELETE',
        contentType: 'application/json',
        xhr: function () {
          return window.XMLHttpRequest == null ||
            new window.XMLHttpRequest().addEventListener == null
            ? new window.ActiveXObject('Microsoft.XMLHTTP')
            : $.ajaxSettings.xhr()
        },
      })
      if (response) {
        this.saved = undefined
      }
    },
    scrollToComments() {
      document.getElementById('comments').scrollIntoView()
    },
    togglePaused() {
      this.$refs.youtube.togglePaused()
    },
    bindKeys() {
      window.onkeydown = (e) => {
        if (e.target.tagName.toUpperCase() !== 'INPUT') {
          if (e.keyCode == 32) {
            // Spacebar
            this.togglePaused()
            return false
          }
          if (e.keyCode == 38) {
            // Up arrow
            this.$refs.transcript.previousLine()
            return false
          }
          if (e.keyCode == 40) {
            // Down arrow
            this.$refs.transcript.nextLine()
            return false
          }
        }
      }
    },
    unbindKeys() {
      window.onkeydown = null
    },
  },
  async mounted() {
    this.mountOrUpdate()
  },
  activated() {
    this.bindKeys()
  },
  deactivated() {
    this.unbindKeys()
  },
}
</script>
<style lang="scss">
.subs-drop.drop.over {
  border: 2px dashed #ccc;
}
.play-pause-wrapper {
  position: sticky;
  bottom: 1rem;
  left: calc(100% - 4rem);
  width: 3.2rem;
  z-index: 9;
}
.play-pause {
  border-radius: 100%;
  width: 3.2rem;
  height: 3.2rem;
  line-height: 3rem;
  border: none;
  font-size: 1.3em;
  cursor: pointer;
}
.speed {
  border-radius: 100%;
  width: 3.2rem;
  height: 3.2rem;
  line-height: 3rem;
  border: none;
  font-size: 1.3em;
  cursor: pointer;
  margin-bottom: 0.2rem;
}
.youtube-video-column.sticky {
  top: 0;
}
.youtube-video-wrapper.sticky {
  top: 0;
}
</style>
