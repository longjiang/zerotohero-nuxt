<template>
  <div class="category-nav">
    <div
      class="row mt-3"
      style="padding-left: 0.75rem; padding-right: 0.75rem"
      v-if="CATEGORIES && Object.keys(CATEGORIES).length > 0"
    >
      <router-link
        v-for="(categoryTitle, categoryId) in CATEGORIES"
        :key="`level-btn-category-${categoryId}`"
        class="col-6 col-md-4 col-lg-3 category-btn-wrapper"
        :to="to(categoryId)"
        v-show="categoryId < 30"
      >
        <div
          :style="`border: none;  background: linear-gradient(#00000077, #00000077), url(/img/categories/bg-category-${categoryId}.jpg); background-size: cover; background-position: center center; padding-top: 2.5rem; padding-bottom: 0.5rem;`"
          class="category-btn"
        >
          {{ $t(categoryTitle) }}
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import { SLUG_TO_CATEGORY_ID, CATEGORIES } from '../lib/youtube';


export default {
  data() {
    return {
      CATEGORIES,
      preferredCategories: [],
      watcherActive: false,
    }
  },
  watch: {
    // set up in setupWatchers()
  },
  async mounted() {

  },
  methods: {
    to(categoryId) {
      return {
        name: "l1-l2-category-slug",
        params: {
          slug: this.categoryIdToSlug(categoryId)
        },
      };
    },
    categoryIdToSlug(categoryId) {
      let slug = Object.keys(SLUG_TO_CATEGORY_ID).find(slug => SLUG_TO_CATEGORY_ID[slug] == categoryId)
      if (!slug) slug = categoryId
      return slug
    },
  }
};
</script>

<style lang="scss" scoped>
.category-btn-wrapper {
  padding: 0.25rem;
}

.category-btn {
  color: white;
  padding: 0.5rem 1rem;
  border: 1px solid #666;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  width: 100%;
  height: 100%;
  display: block;
  text-align: left;
  text-shadow: 0 0 6px #000000;
  position: relative;
  cursor: pointer;
  input {
    position: absolute;
    top: 1rem;
    left: 1rem;
  }
}

@media screen and (min-width: 480px) {
  .category-btn {
    font-size: 1rem;
    padding: 1rem;
  }
}
</style>