<template>
  <div :class="`feed-item feed-item-video skin-${$skin}`">
    <div class="top-part pt-4 pr-4 pl-4 pb-3">
      <div class="show-type-wrapper small text-secondary" v-if="show">
        <span class="show-type-icon">
          <i :class="show.icon"></i>
        </span>
        <span class="show-type ml-1">{{ $t(show.type) }}</span>
      </div>
      <router-link
        v-if="
          video && show
        "
        :to="{
          name: 'show',
          params: {
            type: video.tv_show ? 'tv-show' : 'talk',
            id: video.tv_show ? video.tv_show.id : video.talk.id,
          },
        }"
        class="text-inherit"
      >
        <h5 class="show-title mt-1 mb-0">
          {{ show.show.title }}
        </h5>
      </router-link>
    </div>
    <div class="youtube-thumb">
      <router-link :to="to" class="aspect-wrapper play-button-wrapper d-block">
        <div class="btn btn-unstyled play-button">
          <i class="fa fa-play"></i>
        </div>
        <client-only>
          <b-progress
            class="feed-item-progress"
            v-if="progress"
            :value="progress"
            :max="1"
          ></b-progress>
        </client-only>
        <img
          class="youtube-thumbnail aspect"
          ref="thumbnail"
          :src="thumbnail"
        />
      </router-link>
    </div>
    <div class="bottom-part pt-3 pr-4 pl-4 pb-4">
      <div class="youtube-title">
        <router-link
          :class="{
            'link-unstyled': true,
          }"
          :to="to"
        >
          {{ video.title }}
        </router-link>
      </div>
      <div class="youtube-date mt-2" v-if="video.talk">
        {{ $d(new Date(video.date), "short", $l1.code) }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import DateHelper from "../lib/date-helper";

export default {
  props: {
    l1: undefined,
    l2: undefined,
    showLanguage: {
      default: false,
    },
    showProgress: {
      default: false,
    },
    skin: {
      default: "light", // or 'dark'
    },
    video: {
      type: Object,
    },
  },
  data() {
    return {
      over: false,
      firstLineTime:
        this.video.subs_l2 && this.video.subs_l2[0]
          ? this.video.subs_l2[0].starttime
          : undefined,
      subsUpdated: false,
      assignShow: false,
      subsFile: false,
      showSaved: true,
    };
  },
  computed: {
    ...mapState("history", ["history"]),
    language() {
      let language = this.$languages.l1s.find((l1) => l1.id === this.video.l2);
      return language;
    },
    videoL2() {
      if (this.video.l2) return this.$languages.getById(this.video.l2);
    },
    show() {
      if (
        (this.video.tv_show || this.video.talk) &&
        this.$store.state.shows &&
        this.$store.state.shows.showsLoaded[this.$l2.code]
      ) {
        let tvShows = this.$store.state.shows.tvShows[this.$l2.code];
        let talks = this.$store.state.shows.talks[this.$l2.code];
        let talkId = this.video.talk?.id || this.video.talk;
        let tvShowId = this.video.tv_show?.id || this.video.tv_show;
        let tvShow = tvShows.find((s) => s.id === tvShowId);
        let talk = talks.find((t) => t.id === talkId);
        if (talk) return { type: 'YouTube', icon: "fab fa-youtube", show: talk };
        if (tvShow) return { type: 'TV Show', icon: "fa fa-tv", show: tvShow };
      }
    },
    to() {
      let to = {
        name: "video-view",
        params: {
          type: "youtube",
          youtube_id: this.video.youtube_id,
          l1: this.l1 ? this.l1.code : this.$l1 ? this.$l1.code : "en",
          l2: this.l2
            ? this.l2.code
            : this.videoL2
            ? this.videoL2.code
            : this.$l2.code,
        },
        query: {},
      };

      if (this.video.lesson) {
        to.params.lesson = "lesson";
      }
      if (this.video.starttime) {
        to.query.t = this.video.starttime;
      } else if (this.showProgress && this.historyItem) {
        to.query.t = this.historyItem.video.starttime;
      }
      return to;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    historyId() {
      return `${this.$l2.code}-video-${this.video.youtube_id}`;
    },
    historyItem() {
      if (this.history)
        return this.history.find((i) => i.id === this.historyId);
    },
    progress() {
      if (this.showProgress && this.historyItem) {
        return this.historyItem.video.progress;
      }
    },
    thumbnail() {
      return (
        this.video.thumbnail ||
        `https://img.youtube.com/vi/${this.video.youtube_id}/hqdefault.jpg`
      );
    },
  },
  async mounted() {},
  watch: {},
  methods: {
    formatDate(date) {
      return DateHelper.formatDate(date);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/scss/variables.scss";
.youtube-title {
  font-weight: bold;
  font-size: 1rem;
  line-height: 1.33;
}
.youtube-thumbnail-wrapper {
  overflow: hidden;
}

.youtube-date {
  font-size: 0.8rem;
  color: #999;
}
</style>
