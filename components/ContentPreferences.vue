<template>
  <div class="content-preferences">
    <div
      class="row mt-3"
      style="padding-left: 0.75rem; padding-right: 0.75rem"
      v-if="categories && Object.keys(categories).length > 0"
    >
      <div
        v-for="(category, index) in categories"
        :key="`level-btn-category-${index}`"
        class="col-6 col-md-4 col-lg-3 category-btn-wrapper"
        @click="clickCheckBox"
      >
        <div
          :style="`border: none;  background: linear-gradient(#00000077, #00000077), url(/img/categories/bg-category-${index}.jpg); background-size: cover; background-position: center center; padding-top: 2.5rem; padding-bottom: 0.5rem;`"
          class="category-btn"
        >
          <input type="checkbox" v-model="preferredCategories" :id="'category_' + index" :value="index"  />
          {{ category }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      preferredCategories: []
    }
  },
  computed: {
    ...mapState("shows", ["categories"]),
  },
  methods: {
    clickCheckBox(event) {
      let checkbox = event.target.querySelector('input')
      if (checkbox) checkbox.click()
    }
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