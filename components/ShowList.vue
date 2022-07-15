<template>
  <container-query :query="query" v-model="params">
    <div class="tv-shows row">
      <div
        v-for="show of shows"
        :class="colClasses"
        :key="`tv-show-card-wrapper-${show.id}`"
        style="padding-bottom: 2rem"
      >
        <div class="deck3"></div>
        <div class="deck2"></div>
        <div class="deck1"></div>
        <div
          :class="{
            'tv-show-card media': true,
            'tv-show-card-hidden': show.hidden,
          }"
        >
          <router-link
            class="youtube-thumbnail-wrapper aspect-wrapper d-block"
            :to="path(show)"
          >
            <img
              :src="`https://img.youtube.com/vi/${show.youtube_id}/hqdefault.jpg`"
              class="youtube-thumbnail aspect"
            />
          </router-link>
          <div class="tv-show-card-title">
            <router-link :to="path(show)" class="link-unstyled">
              <h6>
                {{ show.title }}
                <span
                  v-if="show.level"
                  :data-bg-level="levels[show.level].level"
                  class="level-tag"
                >
                  {{ levels[show.level].name }}
                </span>
              </h6>
              <b-button
                v-if="$adminMode"
                size="sm"
                class="admin-hide-button"
                @click.stop.prevent="toggle(show, 'hidden')"
              >
                <i class="far fa-eye" v-if="show.hidden"></i>
                <i class="far fa-eye-slash" v-else></i>
              </b-button>
              <b-button
                v-if="$adminMode"
                size="sm"
                class="admin-audiobook-button"
                @click.stop.prevent="toggle(show, 'audiobook')"
              >
                <i class="fa fa-microphone" v-if="show.audiobook"></i>
                <i class="fa fa-microphone-slash" v-else></i>
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
import { languageLevels } from "@/lib/utils";
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
    colClasses() {
      let classes = {
        "col-compact": this.params.xs,
        "col-6": this.params.xs || this.params.sm,
        "col-4": this.params.md,
        "col-3": this.params.lg || this.params.xl,
      };
      return classes;
    },
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
    levels() {
      return languageLevels(this.$l2);
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
    async toggle(show, property) {
      let toggled = !show[property]; // If true, make it false, and vice versa
      try {
        let path = `items/${this.field}s/${show.id}`;
        let payload = {};
        payload[property] = toggled;
        let response = await this.$directus.patch(path, payload, {
          contentType: "application/json",
        });
        if (response && response.data.data) {
          Vue.set(show, property, toggled);
        }
      } catch (err) {
        // Direcuts bug
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.deck1,
.deck2,
.deck3 {
  height: 4rem;
  position: absolute;
  left: 1rem;
  width: calc(100% - 2rem);
  border-radius: 0.25rem;
  background-color: #565656;
  border: 1px solid rgb(91, 91, 91);
  box-shadow: 1px -3px 4px #00000070;
}
.deck1 {
  top: -0.5rem;
  transform: scale(0.95);
}
.deck2 {
  top: -1rem;
  transform: scale(0.9);
  opacity: 0.75;
}
.deck3 {
  top: -1.5rem;
  transform: scale(0.85);
  opacity: 0.5;
}
.col-compact {
  padding: 0.5rem;
  ::v-deep .media-body {
    font-size: 0.9em;
  }
}
.show-tag {
  font-size: 0.8em;
  color: #888;
}
.show-tags {
  line-height: 1;
}
.tv-show-card {
  position: relative;
  height: 100%;
  box-shadow: 0 -1px 1px #ffffff69;
  &.tv-show-card-hidden {
    opacity: 0.3;
  }
  // &:hover {
  //   transform: scale(110%);
  //   transition: all 200ms ease-out;
  // }
  .youtube-thumbnail {
    border-radius: 0.25rem;
  }
  .tv-show-card-title {
    padding-top: 0.5rem;
    color: #fff;
    a {
      z-index: 1;
      width: 100%;
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
.admin-audiobook-button {
  position: absolute;
  bottom: 0.5rem;
  left: 2rem;
}

.level-tag {
  font-size: 0.7em;
  border-radius: 0.25rem;
  display: inline-block;
  padding: 0.1rem 0.5rem;
}
</style>