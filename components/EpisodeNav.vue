<template>
  <div
    :key="`youtube-video-info-${video.youtube_id}-${videoInfoKey}`"
    :class="{
      'episode-nav': true,
      'episode-nav-dark': skin === 'dark',
      'episode-nav-light': skin === 'light',
      'd-none': !video.id || !show,
      'text-center mb-3': true,
    }"
  >
    <router-link
      v-if="previousEpisode"
      :to="to(previousEpisode)"
      :class="{
        'btn btn-medium': true,
        'btn-light': skin === 'light',
        'btn-black': skin === 'dark',
      }"
    >
      <i class="fa fa-step-backward"></i>
    </router-link>
    <router-link
      v-if="show"
      :to="{
        name: 'show',
        params: {
          type: showType === 'tv_show' ? 'tv-show' : 'talk',
          id: show.id,
        },
      }"
      :class="{
        'btn btn-medium': true,
        'btn-light': skin === 'light',
        'btn-black': skin === 'dark',
        'show-title': true,
      }"
    >
      {{ $t(show.title) }}
      {{ largeEpisodeCount ? "(" + $n(largeEpisodeCount) + ")" : "" }}
      <i class="fa-solid fa-chevron-right ml-1"></i>
    </router-link>
    <router-link
      v-if="episodes && episodes.length && show && !largeEpisodeCount"
      :to="{
        name: 'show',
        params: {
          type: showType === 'tv_show' ? 'tv-show' : 'talk',
          id: show.id,
        },
      }"
      class="small pr-2"
    >
      {{ episodeIndex + 1 }} / {{ $n(episodes.length) }}
    </router-link>
    <router-link
      v-if="nextEpisode"
      :to="to(nextEpisode)"
      :class="{
        'btn btn-medium': true,
        'btn-light': skin === 'light',
        'btn-black': skin === 'dark',
      }"
    >
      <i class="fa fa-step-forward"></i>
    </router-link>
    <router-link
      v-if="episodes && episodes.length > 0"
      :to="{
        name: 'video-view',
        params: {
          type: 'youtube',
          youtube_id: this.randomEpisodeYouTubeId,
        },
      }"
      :class="{
        'btn btn-medium': true,
        'bg-light': skin === 'light',
        'btn-black': skin === 'dark',
      }"
    >
      <i class="fa fa-random"></i>
    </router-link>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
export default {
  props: {
    video: {
      type: Object,
    },
    skin: {
      default: "light",
    },
    episodes: {
      type: Array,
    },
    show: {
      type: Object,
    },
    showType: {
      type: String,
    },
    largeEpisodeCount: {
      type: Number, // Mannually set the number of episode displayed in the episode navigator
    },
  },
  data() {
    return {
      videoInfoKey: 0,
    };
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
    randomEpisodeYouTubeId() {
      let episode = Helper.randomArrayItem(this.episodes);
      return episode.youtube_id;
    },
    previousEpisode() {
      return this.episodeIndex > 0
        ? this.episodes[this.episodeIndex - 1]
        : undefined;
    },
    nextEpisode() {
      return this.episodeIndex < this.episodes.length - 1
        ? this.episodes[this.episodeIndex + 1]
        : undefined;
    },
    episodeIndex() {
      return this.episodes.findIndex(
        (v) => v.youtube_id === this.video.youtube_id
      );
    },
  },
  methods: {
    to(video) {
      return {
        name: "video-view",
        params: {
          type: "youtube",
          youtube_id: video.youtube_id,
          lesson: video.lesson,
        },
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.episode-nav {
  border-radius: 0.2rem;
  padding: 0.3rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  &.episode-nav-light {
    border: 1px solid #00000033;
    a {
      color: #666;
    }
  }
  &.episode-nav-dark {
    border: 1px solid #ffffff33;
    a {
      color: #999;
    }
  }
  .show-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    white-space: nowrap;
    padding-left: 0;
  }
}
</style>