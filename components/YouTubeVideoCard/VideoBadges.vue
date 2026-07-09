<!-- /components/YouTubeVideoCard/VideoBadges.vue -->
<template>
  <div>
    <div class="youtube-video-card-badges" v-if="view === 'grid' && (showBadges || adminMode)">
      <!-- CC badge -->
      <div v-if="video.hasSubs || video.id" class="youtube-video-card-badge">
        {{ $t(videoL2 ? videoL2.name : $l2.name) }} CC
        <span v-if="video.l2Locale">({{ video.l2Locale }})</span>
        <span v-if="subsFile">
          - {{ subsFile.name.replace(/[_.]/g, " ") }}
        </span>
      </div>
      <!-- Language badge -->
      <div v-if="showLanguage && language" class="youtube-video-card-badge">
        {{ $t(language.name) }} ({{ language.code }})
      </div>
      <!-- No subs badge (admin hint) -->
      <div
        v-if="checkSubs && !video.checkingSubs && !video.hasSubs && !video.id"
        class="youtube-video-card-badge"
      >
        <span v-if="!over">No {{ $l2.name }} CC</span>
        <span v-else>Drop SRT to Add Subs</span>
      </div>
      <!-- Added badge -->
      <div
        v-if="checkSaved && video.id"
        class="youtube-video-card-badge bg-success text-white ml-0"
      >
        <i class="fa fa-check mr-2"></i>
        Added
      </div>
      <!-- Add button -->
      <b-button
        v-if="checkSaved && !video.id && (video.hasSubs || generated)"
        class="btn btn-small"
        @click="$emit('add-video')"
      >
        <i class="fas fa-plus mr-2"></i>
        Add
      </b-button>
      <!-- ShowBadge (maybe external) -->
      <ShowBadge :video="video" :showSaved="showSaved" />
      <!-- Remove button -->
      <b-button
        v-if="showAdmin && adminMode && video.id"
        class="youtube-video-card-badge border-0"
        @click="$emit('remove-video')"
      >
        <i class="fa fa-trash"></i>
      </b-button>
    </div>

    <!-- AssignShow for TV and Talks -->
    <div>
      <AssignShow
        v-if="showAdmin && adminMode && video.id && !video.tv_show && !video.talk"
        @assignShow="(show) => $emit('assign-show', show, 'tv-shows')"
        @newShow="(show) => $emit('new-show', show)"
        :defaultYoutubeId="video.youtube_id"
        :defaultTitle="video.title"
        type="tv-shows"
      />
      <AssignShow
        v-if="showAdmin && adminMode && video.id && !video.tv_show && !video.talk"
        @assignShow="(show) => $emit('assign-show', show, 'talks')"
        @newShow="(show) => $emit('new-show', show)"
        :defaultYoutubeId="video.youtube_id"
        :defaultTitle="video.title"
        type="talks"
      />
    </div>
  </div>
</template>

<script>
import AssignShow from "@/components/AssignShow.vue"; // adjust path
import ShowBadge from "@/components/ShowBadge.vue"; // adjust path

export default {
  components: { AssignShow, ShowBadge },
  props: {
    video: { type: Object, required: true },
    checkSubs: { type: Boolean, default: false },
    checkSaved: { type: Boolean, default: false },
    generated: { type: Boolean, default: false },
    showAdmin: { type: Boolean, default: true },
    adminMode: { type: Boolean, default: false }, // $adminMode
    view: { type: String, default: "grid" },
    showLanguage: { type: Boolean, default: false },
    language: { type: Object, default: null }, // computed in parent
    subsFile: { type: Object, default: null },
    showSaved: { type: Boolean, default: true },
    showBadges: { type: Boolean, default: false },
    over: { type: Boolean, default: false }, // for "Drop SRT" hint
  },
  computed: {
    videoL2() {
      if (this.video.l2) return this.$languages.getById(this.video.l2);
      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
.youtube-video-card-badges {
  margin-top: 0.5rem;
  .youtube-video-card-badge {
    background-color: #88888833;
    display: inline-block;
    padding: 0.3rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.8em;
    line-height: 0.9rem;
    color: #666;
  }
  padding-bottom: 0.25rem;
}
</style>