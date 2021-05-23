<template>
  <div>
    <div class="row">
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
import axios from 'axios'

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
  },
  async fetch() {
    let response = await axios.get(`${Config.wiki}items/heroes?fields=*,avatar.*`);
    this.heroes = response.data.data
      .map((hero) => {
        hero.url = `/${this.$l1.code}/${this.$l2.code}/hall-of-heroes/view/${
          hero.id
        },${encodeURIComponent(hero.name)}`;
        return hero;
      })
      .sort((a, b) => {
        return b.score - a.score;
      })
      .sort((a, b) => {
        return b.hsk - a.hsk;
      });
  },
  methods: {
    filter(hero) {
      if (this.category === "featured") {
        return hero.featured === true;
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
