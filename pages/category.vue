<router> { path: '/:l1/:l2/category/:slug', props: true, } </router>
<template>
  <div>
    <div class="container pb-5">
      <SocialHead
        :title="`${$t(title)} | Language Player`"
        :description="`Learn ${$l2.name} with Videos`"
        :image="'/img/tv-shows.jpg'"
      />
      <div class="row">
        <div class="col-sm-12">
          <h3 class="my-4 text-center">{{ $t(title) }}</h3>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div v-if="kidsOnly || category">
            <Shows
              v-bind="{
                kidsOnly,
                category,
                showFilter: false,
                showHero: false,
                routeType: 'talks',
                tag: 'all',
                limit: 12,
                title: 'YouTube Channels',
              }"
              class="mb-4"
            />
          </div>
          <div v-if="kidsOnly || category">
            <Shows
              v-bind="{
                kidsOnly,
                category,
                showFilter: false,
                showHero: false,
                routeType: 'tv-shows',
                tag: 'all',
                limit: 12,
                title: 'TV Shows',
              }"
              class="mb-4"
            />
          </div>
          <div>
            <MediaSearchResults
              v-bind="{
                category,
                tvShows: slug === 'movies' && movies({l2: $l2}) ? [movies({l2: $l2}).id] : slug === 'music' && music({l2: $l2}) ? [music({l2: $l2}).id] : null,
                talks: slug === 'news' && news({l2: $l2}) ? [news({l2: $l2}).id] : null,
                kidsOnly,
                showNoVideosMessage: true,
                perPage: 12,
                showSearchBar: false,
                sort: '-views',
                showTitle: true,
                title: 'Videos',
              }"
              :ref="`videos-${slug}`"
              class="mt-3"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

const slugToCategory = {
  'music': 10, // YouTube category ID, see lib/youtube.js
  'news': 25,
  'sports': 17,
  'gaming': 20,
  'how-to': 26,
  'learning': 27,
}
export default {
  props: {
    slug: String,
  },
  data() {
    return {
      kidsOnly: this.slug === 'kids',
      category: slugToCategory[this.slug]?.toString(),
    };
  },
  computed: {
    ...mapGetters('shows', ['movies', 'music', 'news']),
    title() {
      if (!this.slug) return "";
      return this.slug
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(" ");
    },
  },
  methods: {
  }
};
</script>

<style>
  /* Add your styles here */
</style>
