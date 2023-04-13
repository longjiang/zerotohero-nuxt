<template>
  <container-query :query="query" v-model="params">
    
    <div class="row">
      <div
        :class="{
          'col-12': params.xs || params.sm,
          'col-6': params.md,
          'col-4': params.lg || params.xl,
          'mb-5': true,
        }"
        v-for="(hero, index) in heroes.filter(filter)"
        :key="`hero-list-${index}`"
      >
        <Hero :hero="hero" />
      </div>
    </div>
  </container-query>
</template>

<script>
import Config from "@/lib/config";
import Hero from "@/components/Hero";
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ContainerQuery,
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
      params: {},
      query: {
        xs: {
          minWidth: 0,
          maxWidth: 423,
        },
        sm: {
          minWidth: 423,
          maxWidth: 640,
        },
        md: {
          minWidth: 640,
          maxWidth: 960,
        },
        lg: {
          minWidth: 960,
          maxWidth: 1140,
        },
        xl: {
          minWidth: 1140,
        },
      },
    };
  },
  computed: {
    count() {
      if (this.heroes) {
        return this.heroes.length;
      }
    },
  },
  async fetch() {
    let response = await this.$directus.get(
      `items/heroes?fields=*,avatar.*`
    );
    this.heroes = response.data.data
      .sort((a, b) => {
        return b.score - a.score;
      })
      .sort((a, b) => {
        return b.hsk - a.hsk;
      });
    this.$emit("heroes", this.heroes);
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