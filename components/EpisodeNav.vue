<template>
  <div
    :key="`youtube-video-info-${video.youtube_id}-${videoInfoKey}`"
    :class="{ 'd-none': !video.id || !show, 'text-center mb-3': true }"
    style="
      border-radius: 0.2rem;
      border: 1px solid #ffffff33;
      padding: 0.3rem;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    "
  >
    <router-link
      v-if="previousEpisode"
      :to="previousEpisode"
      :class="{
        'btn btn-medium': true,
        'btn-primary': skin === 'light',
        'btn-black': skin === 'dark',
      }"
    >
      <i class="fa fa-step-backward"></i>
    </router-link>
    <router-link
      v-if="show"
      :to="`/${$l1.code}/${$l2.code}/show/${
        showType === 'tv_show' ? 'tv-show' : 'talk'
      }/${show.id}`"
      :class="{
        'btn btn-medium': true,
        'btn-primary': skin === 'light',
        'btn-black': skin === 'dark',
      }"
      style="
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-block;
        white-space: nowrap;
        padding-left: 0;
      "
    >
      {{ show.title }}
    </router-link>
    <router-link
      v-if="episodes && episodes.length && show"
      :to="`/${$l1.code}/${$l2.code}/show/${
        showType === 'tv_show' ? 'tv-show' : 'talk'
      }/${show.id}`"
      class="small pr-2"
    >
      {{ episodeIndex + 1 }} / {{ episodes.length }}
    </router-link>
    <router-link
      v-if="nextEpisode"
      :to="nextEpisode"
      :class="{
        'btn btn-medium': true,
        'btn-primary': skin === 'light',
        'btn-black': skin === 'dark',
      }"
    >
      <i class="fa fa-step-forward"></i>
    </router-link>
    <router-link
      v-if="episodes && episodes.length > 0"
      :to="`/${this.$l1.code}/${this.$l2.code}/youtube/view/${this.randomEpisodeYouTubeId}`"
      :class="{
        'btn btn-medium': true,
        'bg-secondary': skin === 'light',
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
    previousEpisode: {
      type: String,
    },
    nextEpisode: {
      type: String,
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
    episodeIndex: {
      type: Number,
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
  },
};
</script>

<style scoped>
a {
  color: #999;
}
</style>