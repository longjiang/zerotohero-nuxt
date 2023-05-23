<template>
  <div class="show-card" :class="{ 'tv-show-card-hidden': show.hidden }">
    <VideoThumbnailStack :thumbnail="thumbnail" :to="to" :title="show.title">
      <template #afterTitle
        ><span
          v-if="show.level"
          :data-bg-level="levels[show.level].level"
          class="level-tag"
        >
          {{ levels[show.level].name }}
        </span></template
      >
      <template #belowTitle
        ><MediaItemStats
          :item="show"
          style="font-size: 0.8em; margin-top: 0.25rem; opacity: 0.8" />
        <div v-if="$adminMode">
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
          </b-button></div
      ></template>
    </VideoThumbnailStack>
  </div>
</template>

<script>
import { languageLevels, formatK } from "@/lib/utils";
import { mapState } from "vuex";
import Vue from "vue";
export default {
  data() {
    return {
      field: this.type === "tvShows" ? "tv_show" : "talk",
      slug: this.type === "tvShows" ? "tv-show" : "talk",
    };
  },
  props: {
    show: {
      type: Object,
    },
    type: {
      type: String, // 'tvShows' or 'talks'
    },
  },
  computed: {
    ...mapState("shows", ["categories"]),
    levels() {
      return languageLevels(this.$l2);
    },
    thumbnail() {
      return `https://img.youtube.com/vi/${this.show.youtube_id}/hqdefault.jpg`;
    },
    to() {
      const showList = {
        name: "show",
        params: { type: this.slug, id: this.show.id },
      };
      const firstEpisode = {
        name: "video-view",
        params: { type: "youtube", youtube_id: this.show.youtube_id },
      };
      const to =
        this.$adminMode || !this.show.youtube_id ? showList : firstEpisode;
      return to;
    },
  },
  methods: {
    async remove(show) {
      if (
        confirm(
          `Are you sure you want to remove the show "${show.title} (${show.id})?"`
        )
      ) {
        this.$store.dispatch("shows/remove", {
          l2: this.$l2,
          type: this.type,
          show,
        });
      }
    },
    async toggle(show, property) {
      let toggled = !show[property]; // If true, make it false, and vice versa
      let path = `items/${this.field}s/${show.id}`;
      let payload = {};
      payload[property] = toggled;
      let response = await this.$directus.patch(path, payload, {
        contentType: "application/json",
      });
      if (response && response.data.data) {
        Vue.set(show, property, toggled);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/variables.scss";

.show-tag {
  font-size: 0.8em;
  color: #888;
}

.show-tags {
  line-height: 1;
}

.level-tag {
  font-size: 0.7em;
  border-radius: 0.25rem;
  display: inline-block;
  padding: 0.1rem 0.5rem;
  position: relative;
  bottom: 0.1rem;
}
</style>
