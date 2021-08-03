<template>
  <div class="tv-shows row">
    <div
      class="col-xs-12 col-sm-6 col-md-4 col-lg-3"
      v-for="show of shows"
      :key="`tv-show-wrapper-${show.id}`"
      style="padding-bottom: 2rem"
    >
      <div class="tv-show media rounded shadow">
        <router-link
          class="youtube-thumbnail-wrapper aspect-wrapper d-block"
          :to="path(show)"
        >
          <img
            :src="`//img.youtube.com/vi/${show.youtube_id}/hqdefault.jpg`"
            class="youtube-thumbnail aspect"
            v-lazy-load
          />
        </router-link>
        <div class="media-body">
          <router-link :to="path(show)" class="link-unstyled">
            <h6>
              {{ show.title }}
            </h6>
            <b-button
              v-if="$adminMode"
              class="btn btn-small bg-danger text-white mt-2 ml-0"
              @click.stop.prevent="remove(show)"
            >
              <i class="fa fa-trash"></i>
            </b-button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    shows: Array,
    type: String, // 'tvShows' or 'talks'
  },
  methods: {
    async remove(show) {
      this.$store.dispatch("shows/remove", {
        l2: this.$l2,
        type: this.type,
        show,
      });
    },
    path(show) {
      return `/${this.$l1.code}/${this.$l2.code}/show/${
        this.type === "tvShows" ? "tv-show" : "talk"
      }/${encodeURIComponent(show.id)}`;
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
};
</script>

<style>
.tv-shows {
}
.tv-show {
  height: 100%;
}
@media (min-width: 768px) {
  .tv-show {
  }
}
.tv-show-thumbnail {
  width: 100%;
  max-height: 270px;
  object-fit: cover;
}
</style>