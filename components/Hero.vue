<template>
  <div class="hero">
    <div class="avatar-percentage-wrapper">
      <div
        :class="
          `c100 p${Math.floor(
            (parseInt(hero.score) / fullScore(hero.hsk)) * 100
          )} percentage`
        "
      >
        <span class="avatar-wrapper"
          ><img
            :src="
              hero.avatar
                ? hero.avatar.data.thumbnails[0].url
                : '/img/default-avatar.jpg'
            "
            alt=""
            class="avatar"
            v-lazy-load
        /></span>
        <div class="slice">
          <div
            class="bar"
            :style="`border-color: ${Helper.hskColors[hero.hsk]}`"
          ></div>
          <div
            class="fill"
            :style="`border-color: ${Helper.hskColors[hero.hsk]}`"
          ></div>
        </div>
      </div>
    </div>
    <div>
      <div class="name-wrapper shadow">
        <h5 class="mb-0 text-center">{{ hero.name }}</h5>
      </div>

      <div class="p-3 text-center shadow" :data-bg-level="hero.hsk">
        <div>
          HSK {{ hero.hsk }} Score: <span class="bigger"><b>{{ hero.score }}</b></span> /
          {{ fullScore(hero.hsk) }}
        </div>
        <div v-if="hero.official" class="mt-2"><i class="fa fa-certificate" /> Official Test</div>
      </div>
      <div v-html="hero.body" class="body shadow"></div>
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'
export default {
  data() {
    return {
      Helper
    }
  },
  props: {
    hero: {
      type: Object
    }
  },
  mounted() {

  },
  methods: {
    fullScore(hsk) {
      if (hsk < 3) return 200
      return 300
    }
  }
}
</script>

<style>
.avatar {
  border-radius: 100%;
  width: 6rem;
  height: 6rem;
  object-fit: cover;
  margin-bottom: 0.4rem;
}
.percentage {
  float: none;
  margin: 0 auto;
  display: block;
  text-align: center;
  margin-bottom: -4rem;
}
.name-wrapper {
  padding: 1rem;
  padding-top: 5rem;
  background-color: #f1f1f1;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}
.body {
  background-color: #f1f1f1;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  padding: 2rem;
}
</style>
