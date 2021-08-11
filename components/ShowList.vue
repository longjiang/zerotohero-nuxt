<template>
  <container-query :query="query" v-model="params">
    <div class="tv-shows row">
      <div
        :class="{
          'col-12': params.xs,
          'col-6': params.sm,
          'col-4': params.md,
          'col-3': params.lg,
        }"
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
  </container-query>
</template>

<script>
import { ContainerQuery } from "vue-container-query";
export default {
  components: {
    ContainerQuery,
  },
  props: {
    shows: Array,
    type: String, // 'tvShows' or 'talks'
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