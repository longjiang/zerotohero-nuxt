<template>
  <container-query :query="query" v-model="params">
    <div>
      <div v-show="title && shows && shows.length">
        <h5>
          {{ $t(title) }}
          <router-link
            v-if="toMore"
            :to="toMore"
            class="show-all"
          >
            {{ $t("More") }}
            <i class="fas fa-chevron-right"></i>
          </router-link>
        </h5>
        <RecommendedMessage class="mt-2" v-if="showRecommendedMessage" />
        <hr class="my-4" />
      </div>
      <div class="tv-shows row">
        <ShowCard
          v-for="show of shows"
          v-show="!unavailableShows.includes(show)"
          :show="show"
          :type="type"
          :key="`tv-show-card-wrapper-${show.id}`"
          :class="colClasses"
          @unavailable="unavailableShows.push(show)"
        />
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
    title: String,
    showRecommendedMessage: Boolean,
    toMore: Object,
  },
  data() {
    return {
      unavailableShows: [],
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
  },
};
</script>

<style lang="scss" scoped>
.col-compact {
  padding: 0.5rem;
}
</style>
