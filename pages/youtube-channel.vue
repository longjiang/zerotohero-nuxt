<router>
  {
    path: '/:l1/:l2/youtube/channel/:channel_id?',
    props: true,
    meta: {
      title: 'Study YouTube Subtitles | Zero to Hero',
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
  <div class="youtube-browse container mt-5 mb-5 main">
    <div class="row">
      <div class="col-sm-12">
        <h1 class="mb-4 text-center">
          YouTube Channel {{ channel_id }}
        </h1>
        <template v-if="!loading">
          <!--
          <h4 class="text-center mt-5">{{ $t('Videos') }}</h4>
          <hr class="mb-5" />
          <YouTubeVideoList :videos="videos" />
          -->
          <h4 class="text-center mt-5">{{ $t('Playlists') }}</h4>
          <hr />
          <YouTubePlaylists :playlists="playlists" />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import YouTubeVideoList from '@/components/YouTubeVideoList'
import YouTubePlaylists from '@/components/YouTubePlaylists'
import YouTube from '@/lib/youtube'
import Config from '@/lib/config'

export default {
  components: {
    YouTubeVideoList,
    YouTubePlaylists,
  },
  props: {
    channel_id: {
      type: String,
    },
  },
  data() {
    return {
      title: undefined,
      playlists: [],
      videos: [],
      avatar: undefined,
      loading: true,
      saved: false,
    }
  },
  mounted() {
    this.update()
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
    async getSaved() {
      this.saved = false
      let response = (
        await axios.get(
          `${Config.wiki}items/youtube_channels?filter[channel_id][eq]=${this.channel_id}`
        )
      ).data
      if (response && response.length > 0) {
        this.saved = response
      }
    },
    async save() {
      let file = await $.post(`${Config.wiki}files`, {
        data: this.avatar,
      })
      let success = await $.post(`${Config.wiki}items/youtube_channels`, {
        channel_id: this.channel_id,
        name: this.title,
        language: this.$l2.id,
        avatar: file.data.id,
      })
      if (success) {
        this.saved = success.data
      }
    },
    async update() {
      this.title = undefined
      this.avatar = undefined
      this.videos = []
      this.getSaved()
      // YouTube.channel(
      //   this.channel_id,
      //   channel => {
      //     this.title = channel.title
      //     this.videos = channel.videos.filter(video => video.cc)
      //     this.avatar = channel.avatar
      //     this.loading = false
      //   },
      //   3600
      // )
      let playlists = await YouTube.channelPlayListsByAPI(this.channel_id)
      if (playlists) {
        this.playlists = playlists.sort((a,b) => b.count - a.count)
      }
      this.loading = false
    },
  },
  watch: {
    channel_id() {
      if (this.$route.name === 'youtube-channel') {
        this.update()
      }
    },
  },
}
</script>

<style>
.avatar {
  border-radius: 100%;
  height: 4rem;
}
</style>
