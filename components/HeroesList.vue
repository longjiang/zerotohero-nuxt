<template>
  <div>
    <div class="row justify-content-center">
      <div
        class="col-md-6 col-lg-4 mb-5"
        v-for="(hero, index) in heroes.filter(filter)"
        :key="`hero-list-${index}`"
      >
        <Hero :hero="hero" />
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Hero from "@/components/Hero";
import axios from "axios";

export default {
  components: {
    Hero,
  },
  props: {
    category: {
      type: String,
    },
    hsk: {
      type: String,
    },
  },
  data() {
    return {
      heroes: [],
    };
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
  async fetch() {
    let response = await axios.get(
      `${Config.wiki}items/heroes?fields=*,avatar.*`
    );
    this.heroes = response.data.data
      .sort((a, b) => {
        return b.score - a.score;
      })
      .sort((a, b) => {
        return b.hsk - a.hsk;
      });
    this.$emit('heroes', this.heroes)
  },
  methods: {
    filter(hero) {
      if (this.category === "featured") {
        return hero.featured === 1;
      } else if (this.category === "hsk") {
        return this.hsk === "all" || hero.hsk === this.hsk;
      } else {
        return true;
      }
    },
  },
};
</script>

<style></style>