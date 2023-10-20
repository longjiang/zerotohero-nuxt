<router>
  {
    path: '/:l1/:l2/youtube/channel/:channel_id?/:title?',
    props: true,
    meta: {
      title: 'Study YouTube Subtitles | Language Player',
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
  <div>
    <div class="container pb-5">
      <div class="container text-center my-5" v-if="!channel">
        <Loader message="Loading..." :sticky="true" />
      </div>
      <div class="row mt-3 mb-5" v-if="channel">
        <div class="col-12">
          <div class="d-flex align-items-center justify-content-center">
            <ChannelCard :channel_id="channel.channel_id" />
          </div>
          <div class="mt-3 text-center small" style="opacity: 0.7" v-if="$adminMode">Channel ID: {{ channel_id }}</div>
        </div>
      </div>
      <div class="row" v-if="$adminMode">
        
        <div class="col-sm-12" >
          <div class="text-center">
            <b-button variant="outline-success" @click="showPlaylists = !showPlaylists">{{ !showPlaylists ? 'Show' : 'Hide' }} Playlists</b-button>
            <b-button
              variant="outline-secondary"
              @click="forceRefresh"
              v-if="showPlaylists"
            >
              <i class="fa fa-sync-alt mr-1"></i>
              Force Refresh
            </b-button>
          </div>
          <template v-if="!loading && showPlaylists">
            <YouTubePlaylists :playlists="playlists" :skin="$skin" />
          </template>
        </div>
      </div>
      <div class="row" v-if="channel">
        <div class="col-12">
          <p style="opacity: 0.75; line-height: 1.75; font-size: 0.8rem" class="text-center">{{ channel.description }}</p>
          <MediaSearchResults
            v-bind="{
              params: {
                'filter[channel_id][eq]': channel.channel_id,
              },
              noVideosMessage: 'No videos found in this channel.',
              limit: 12,
            }"
            class="my-3"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import YouTube from "@/lib/youtube";
import { mapState } from "vuex";

export default {
  props: {
    channel_id: {
      type: String,
    },
    title: {
      type: String,
    },
  },
  data() {
    return {
      playlists: [],
      videos: [],
      loading: true,
      saved: false,
      channel: null,
      showPlaylists: false
    };
  },
  mounted() {
    this.loadChannelPlaylists();
  },
  computed: {
    ...mapState("channels", ["fetchedL2Ids"]),
  },
  watch: {
    fetchedL2Ids(l2Ids) {
      if (l2Ids.includes(this.$l2.id)) {
        this.loadChannel();
      }
    },
  },
  created() {
    if (this.fetchedL2Ids.includes(this.$l2.id)) {
      this.loadChannel();
    }
  },
  methods: {
    forceRefresh() {
      this.loadChannelPlaylists({ forceRefresh: true });
    },
    loadChannel() {
      console.log("loadChannel", this.channel_id);
      this.channel = this.$store.getters["channels/getChannelbyChannelId"](
        this.channel_id
      );
      if (this.$adminMode) this.loadChannelPlaylists();
    },
    async loadChannelPlaylists(options) {
      options = options || {};
      options = Object.assign(
        {
          forceRefresh: false,
        },
        options
      );
      this.loading = true;
      this.videos = [];
      let playlists = await YouTube.channelPlayListsByAPI(
        this.channel_id,
        options.forceRefresh ? 0 : -1
      );
      if (playlists) {
        playlists = playlists.sort((a, b) => b.count - a.count);
        let allVideosPlaylist = {
          id: this.channel_id.replace("UC", "UU"),
          title:
            "All Uploaded Videos" +
            (this.title ? ' of ' + this.title : ""),
        };
        if (playlists[0]) allVideosPlaylist.thumbnail = playlists[0].thumbnail;
        playlists = [allVideosPlaylist, ...playlists];
        this.playlists = playlists;
      }
      this.loading = false;
    },
  },
};
</script>

<style>
.avatar {
  border-radius: 100%;
  height: 4rem;
}
</style>
