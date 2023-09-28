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
          <h3 class="mt-3 text-center">{{ $t(title) }}</h3>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          
          <div
            v-show="
              $refs['talks'] &&
              $refs['talks'].filteredShows &&
              $refs['talks'].filteredShows.length > 0
            "
            class="mb-5"
          >
            <h5>
              {{ $t("YouTube Channels") }}
            </h5>
            <hr />
            <Shows
              v-bind="{
                kidsOnly,
                category,
                level,
                showFilter: false,
                showHero: false,
                routeType: 'talks',
                tag: 'all',
                limit: 12,
              }"
              ref="talks"
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
      category: slugToCategory[this.slug],
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
