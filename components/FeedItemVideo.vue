<template>
  <div :class="`feed-item feed-item-${skin}`">
    <div class="top-part pt-4 pr-4 pl-4 pb-2">
      <div class="show-type-wrapper small text-success" v-if="show">
        <span class="show-type-icon">
          <i :class="show.icon"></i>
        </span>
        <span class="show-type ml-1" >{{ show.type }}</span>
      </div>
      <h5 class="show-title mt-1" v-if="show && !['News', 'Movie', 'Music'].includes(show.show.title)">{{ show.show.title }}</h5>
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
        {{ formatDate(video.date) }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import DateHelper from "@/lib/date-helper";

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
      if (this.video.talk) {
        let talk = this.video.talk;
        let type =
          talk.title === "News"
            ? "News Report"
            : talk.audiobook
            ? "Audiobook"
            : "YouTube";
        let icon =
          talk.title === "News"
            ? "fa fa-newspaper"
            : talk.audiobook
            ? "fa fa-book-open"
            : "fab fa-youtube";
        return { type, icon, show: talk };
      } else if (this.video.tv_show) {
        let tvShow = this.video.tv_show;
        let type =
          tvShow.title === "Movies"
            ? "Movie"
            : tvShow.title === "Music"
            ? "Song"
            : "TV Show";
        let icon =
          tvShow.title === "Movies"
            ? "fa fa-film"
            : tvShow.title === "Music"
            ? "fa fa-music"
            : "fa fa-tv";
        return { type, icon, show: tvShow };
      }
    },
    to() {
      let to = {
        name: "youtube-view",
        params: {
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
    $l1() {
      if (typeof this.l1 !== "undefined") {
        return this.l1;
      } else if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
      else return this.$languages.getSmart("en");
    },
    $l2() {
      if (typeof this.l2 !== "undefined") {
        return this.l2;
      } else if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
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
