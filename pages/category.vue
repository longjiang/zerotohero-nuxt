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
          <!-- <div v-if="kidsOnly || category">
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
          </div> -->
          <div>
            <MediaSearchResults
              v-bind="{
                category: categoryId,
                tvShows: slug === 'movies' && movies({l2: $l2}) ? [movies({l2: $l2}).id] : slug === 'music' && music({l2: $l2}) ? [music({l2: $l2}).id] : null,
                talks: slug === 'news' && news({l2: $l2}) ? [news({l2: $l2}).id] : null,
                kidsOnly,
                noVideosMessage: 'No videos found in this category.',
                perPage: 12,
                showSearchBar: false,
                sort: slug === 'news' ? '-date' : '-views',
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
import { CATEGORIES, SLUG_TO_CATEGORY_ID } from '@/lib/youtube';

export default {
  props: {
    slug: String, // Either the category id, or a custom slug like 'music' that maps to category 10
  },
  data() {
    return {
      kidsOnly: this.slug === 'kids',
    };
  },
  computed: {
    ...mapGetters('shows', ['movies', 'music', 'news']),
    categoryId() {
      let categoryId = SLUG_TO_CATEGORY_ID[this.slug]?.toString()
      if (!categoryId) categoryId = this.slug
      return categoryId
    },
    title() {
      if (!this.slug) return "";
      if (this.slug in SLUG_TO_CATEGORY_ID) {
        // A custom slug
        return this.slug
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
          .join(" ");
      } else {
        // A category id
        return CATEGORIES[this.slug];
      }
    },
  },
};
</script>

<style>
  /* Add your styles here */
</style>
