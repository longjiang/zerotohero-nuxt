<template>
  <container-query :query="query" v-model="params">
    <div class="playlists row">
      <div
        :class="{
          'col-sm-12 text-center': true,
          'd-none': playlistsByLanguage,
        }"
        style="flex: 1"
      >
        <Loader :sticky="true" message="Loading Playlists..." />
      </div>
      <div
        class="col-sm-12"
        v-if="playlistsByLanguage && playlistsByLanguage.length === 0"
      >
        {{
          $t("You have not created any playlists for {l2}.", {
            l2: $t($l2.name),
          })
        }}
      </div>
      <div
        v-for="playlist in playlistsByLanguage"
        :key="playlist.id"
        :class="colClasses"
      >
        <VideoThumbnailStack
          :thumbnail="thumbnail(playlist.videos?.[0].youtube_id)"
          :title="playlist.title"
          :to="{
            name: 'playlist',
            params: { id: playlist.id },
          }"
        >
          <template v-slot:belowTitle>
            <div style="opacity: 0.8; font-size: 0.8em; margin-top: 0.25rem">
              ({{ $t("{num} Videos", { num: playlist.videos?.length }) }})
            </div>
          </template>
        </VideoThumbnailStack>
      </div>
    </div>
  </container-query>
</template>

<script>
import { mapState } from "vuex";
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ContainerQuery,
  },
  data() {
    return {
      params: {},
      query: {
        xs: {
          minWidth: 0,
          maxWidth: 423,
        },
        sm: {
          minWidth: 423,
          maxWidth: 720,
        },
        md: {
          minWidth: 720,
          maxWidth: 960,
        },
        lg: {
          minWidth: 960,
          maxWidth: 1140,
        },
        xl: {
          minWidth: 1140,
        },
      },
    };
  },
  computed: {
    ...mapState("playlists", {
      playlistsByLanguage(state) {
        return state.playlists[this.$l2.code] || [];
      },
    }),
    colClasses() {
      let classes = {
        "col-compact": this.params.xs,
        "col-6": this.params.xs || this.params.sm,
        "col-4": this.params.md,
        "col-3": this.params.lg || this.params.xl,
      };
      return classes;
    },
  },
  methods: {
    thumbnail(youtube_id) {
      return `https://img.youtube.com/vi/${youtube_id}/mqdefault.jpg`;
    },
  },
  async created() {
    // Playlists of the current l2 are already loaded from default.vue
  },
};
</script>
