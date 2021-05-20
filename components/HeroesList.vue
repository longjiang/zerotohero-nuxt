<template>
  <div>
    <div class="row">
      <div
        class="col-md-6 col-lg-4 mb-5"
        v-for="hero in heroes"
        v-if="filter(hero)"
      >
        <Hero :hero="hero" />
      </div>
    </div>
  </div>
</template>

<script>
import Config from '@/lib/config'
import Hero from '@/components/Hero'

export default {
  components: {
    Hero
  },
  props: {
    category: {
      type: String
    },
    hsk: {
      type: String
    }
  },
  data() {
    return {
      heroes: []
    }
  },
  mounted() {
    this.get()
  },
  methods: {
    filter(hero) {
      if (this.category === 'featured') {
        return hero.featured === true
      } else if (this.category === 'hsk') {
        return this.hsk === 'all' || hero.hsk === this.hsk
      } else {
        return true
      }
    },
    get() {
      $.getJSON(`${Config.wiki}items/heroes?fields=*,avatar.*`, response => {
        this.heroes = response.data
          .map(hero => {
            hero.url = `/${this.$l1.code}/${this.$l2.code}/hall-of-heroes/view/${hero.id},${encodeURIComponent(
              hero.name
            )}`
            return hero
          })
          .sort((a, b) => {
            return b.score - a.score
          })
          .sort((a, b) => {
            return b.hsk - a.hsk
          })
      })
    }
  }
}
</script>

<style></style>
