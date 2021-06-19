<template>
  <div class="tv-shows">
    <div
      class="tv-show media rounded shadow"
      v-for="show of shows"
      :key="`tv-show-${show.id}`"
    >
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
        <router-link
          :to="path(show)"
          class="link-unstyled"
        >
          <h6>
            <Annotate>
              <span>{{ show.title }}</span>
            </Annotate>
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
      return `/${this.$l1.code}/${this.$l2.code}/show/${this.type === 'tvShows' ? 'tv-show' : 'talk' }/${encodeURIComponent(
        show.id
      )}`;
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
  display: flex;
  flex-wrap: wrap;
  margin: 0 -1rem;
}
.tv-show {
  min-width: 12rem;
  max-width: calc(100% - 2rem);
  flex: 1;
  margin: 1rem;
}
@media (min-width: 768px) {
  .tv-show {
    max-width: calc(50% - 2rem);
  }
}
.tv-show-thumbnail {
  width: 100%;
  max-height: 270px;
  object-fit: cover;
}
</style>