<template>
  <div class="container">
    <h3 class="title text-center">What do our students say about us?</h3>
    <p class="text-center" style="font-size: 1.15em; margin-top: 1rem; margin-bottom: 2rem">
      Read experiences from {{ count }} of our students who took our courses and
      passed the HSK exams.
    </p>
    <div class="testimonial-container mt-3">
      <HeroesList
        category="featured"
        ref="heroes"
        @heroes="updateHeroes"
      />
    </div>
    <div class="button-container d-flex justify-content-center mt-2 mb-3">
      <router-link to="/en/zh/hall-of-heroes">
        <b-button data-bg-level="3" class="btn btn-lg"><i class="fas fa-trophy mr-1"></i> See All {{ count }} Heroes</b-button>
      </router-link>
    </div>
  </div>
</template>

<script>
import HeroesList from "@/components/HeroesList";

export default {
  data() {
    return {
      heroes: undefined,
    };
  },
  components: {
    HeroesList,
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    count() {
      if (this.heroes) {
        return this.heroes.length;
      }
    },
  },
  methods: {
    updateHeroes(heroes) {
      this.heroes = heroes;
    },
  },
};
</script>
