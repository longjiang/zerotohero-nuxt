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
          <h3 class="mt-3 mb-3 text-center">{{ $t(title) }}</h3>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div>
            <template v-if="$refs['talks']?.filteredShows?.length">
              <h5>
                {{ $t("YouTube Channels") }}
              </h5>
              <hr />
            </template>
            <Shows
              v-bind="{
                kidsOnly,
                category,
                showFilter: false,
                showHero: false,
                routeType: 'talks',
                tag: 'all',
                limit: 12,
              }"
              ref="talks"
            />
          </div>
          <div>
            <template v-if="$refs['tv-shows']?.filteredShows?.length">
              <h5 class="mt-3">
                {{ $t("TV Shows") }}
              </h5>
              <hr />
            </template>
            <Shows
              v-bind="{
                kidsOnly,
                category,
                showFilter: false,
                showHero: false,
                routeType: 'tv-shows',
                tag: 'all',
                limit: 12,
              }"
              ref="tv-shows"
            />
          </div>
          <div>
            <template v-if="$refs['videos']?.videos?.length">
              <h5 class="mt-3">
                {{ $t("Videos") }}
              </h5>
              <hr />
            </template>
            <MediaSearchResults
              v-bind="{
                category,
                kidsOnly,
                includeTVShows: true,
                showNoVideosMessage: true,
                perPage: 12,
                showSearchBar: false,
              }"
              ref="videos"
              class="mt-3"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

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
