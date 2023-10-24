
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
                params: mediaSearchParams,
                noVideosMessage: 'No videos found in this category.',
                limit: 12,
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
import { CATEGORIES, SLUG_TO_CATEGORY_ID } from '../lib/youtube';

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
    mediaSearchParams() {

      let params = {}
      if (this.categoryId)
        params['filter[category][eq]'] = this.categoryId
      if (this.slug === 'music') params['filter[type][eq]'] = 'music';
      if (this.slug === 'movies') params['filter[type][eq]'] = 'movie';
      if (this.slug === 'news') params['filter[type][eq]'] = 'news';
      if (this.slug === 'kids') params['filter[made_for_kids][eq]'] = 1;
      if (this.slug === 'news' || this.categoryId === 25) params.sort = '-date'; // Sort news by date
      return params;
    },
    categoryId() {
      if (Number(this.slug) == this.slug)
      return Number(this.slug)
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
