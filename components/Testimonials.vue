<template>
  <div class="container my-5 pb-3">
    <h3 class="title text-center">What do our students say about us?</h3>
    <p class="text-center">
      Read experiences from over 80 students who took our courses and passed the
      HSK exams.
    </p>
    <div class="button-container d-flex justify-content-center mt-2">
      <a href="/en/zh/hall-of-heroes">
        <button data-bg-level="3" class="btn">Read All Submissions</button>
      </a>
    </div>

    <div class="testimonial-container mt-5 pt-2">
      <HeroesList category="featured" class="mt-5" />
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import HeroesList from "@/components/HeroesList";

export default {
  data() {
    return {
      heroes: [],
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
  },
  methods: {
    async get() {
      let response = await axios.get(
        `${Config.wiki}items/heroes?fields=*,avatar.*`
      );
      this.heroes = response.data.data.map((hero) => {
        hero.url = `/${this.$l1.code}/${this.$l2.code}/hall-of-heroes/view/${
          hero.id
        },${encodeURIComponent(hero.name)}`;
        return hero;
      });
    },
    getByName(name) {
      for (let i = 0; i < this.heroes.length; i++) {
        let loopedName = this.heroes[i].name.toLowerCase().trim();
        let passedName = name.toLowerCase().trim();

        if (loopedName === passedName) return this.heroes[i];
      }

      return {}; // return empty by default to avoid error
    },
  },
  mounted() {
    this.get();
  },
};
</script>
