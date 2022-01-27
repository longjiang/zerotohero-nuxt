<template>
  <container-query :query="query" v-model="params">
    <div class="tv-shows row">
      <div
        :class="{
          'col-6': params.xs,
          'col-4': params.sm,
          'col-3': params.md,
          'col-2': params.lg,
        }"
        v-for="show of shows"
        :key="`tv-show-card-wrapper-${show.id}`"
        style="padding-bottom: 2rem"
      >
        <div
          :class="{
            'tv-show-card media': true,
            'tv-show-card-hidden': show.hidden,
          }"
        >
          <router-link
            class="
              youtube-thumbnail-wrapper
              eight-to-nine-aspect-wrapper
              d-block
            "
            :to="path(show)"
          >
            <img
              :src="`//img.youtube.com/vi/${show.youtube_id}/hqdefault.jpg`"
              class="youtube-thumbnail aspect"
              style="transform: scale(1.4)"
              v-lazy-load
            />
          </router-link>
          <div class="tv-show-card-title">
            <router-link :to="path(show)" class="link-unstyled">
              <h6>
                {{ show.title }}
              </h6>
              <b-button
                v-if="$adminMode"
                size="sm"
                class="admin-hide-button"
                @click.stop.prevent="toggleHidden(show)"
              >
                <i class="far fa-eye" v-if="show.hidden"></i>
                <i class="far fa-eye-slash" v-else></i>
              </b-button>
              <b-button
                v-if="$adminMode"
                size="sm"
                class="admin-remove-button"
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
import Config from "@/lib/config";
import Vue from "vue";

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
      field: this.type === "tvShows" ? "tv_show" : "talk",
      slug: this.type === "tvShows" ? "tv-show" : "talk",
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
        this.slug
      }/${encodeURIComponent(show.id)}`;
    },
    async toggleHidden(show) {
      let hidden = !show.hidden;
      try {
        let url = `${Config.wiki}items/${this.field}s/${show.id}`;
        let response = await axios.patch(
          url,
          { hidden },
          { contentType: "application/json" }
        );
        if (response && response.data.data) {
          Vue.set(show, "hidden", hidden);
        }
      } catch (err) {
        // Direcuts bug
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.tv-show-card {
  height: 100%;
  box-shadow: 0 5px 25px #fd89662f;
  border-radius: 0.25rem;
  &.tv-show-card-hidden {
    opacity: 0.3;
  }
  // &:hover {
  //   transform: scale(110%);
  //   transition: all 200ms ease-out;
  // }
  .tv-show-thumbnail {
    width: 100%;
    max-height: 270px;
    object-fit: cover;
  }
  .tv-show-card-title {
    overflow: hidden;
    padding: 44% 1.5rem;
    position: relative;
    height: 5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(78, 75, 75);
    background: radial-gradient(
      circle,
      rgb(44, 43, 43) 0%,
      rgb(10, 10, 10) 100%
    );
    a {
      z-index: 1;
      width: 100%;
      text-align: center;
    }
    .tv-show-card-title-image {
      object-fit: cover;
      position: absolute;
      width: 100%;
      height: 100%;
      filter: blur(15px);
      z-index: 0;
      opacity: 0.25;
      transform: scale(1.5);
    }
  }
}

.admin-remove-button {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
}
.admin-hide-button {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
}
</style>