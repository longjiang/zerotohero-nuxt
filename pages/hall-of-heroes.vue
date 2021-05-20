<router>
  {
    path: '/:l1/:l2/hall-of-heroes',
    meta: {
      title: 'Hall of Heroes | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content:
            'In this page we showcase some of our students who have successfully passed language exams after taking courses from us! Read their testimonials and reviews.'
        }
      ]
    }
  }
</router>
<template>
  <div class="container mb-5">
    <div class="row">
      <div class="col-sm-12">
        <h1 class="text-center mt-5 mb-5">Hall of Heroes</h1>
        <p class="lead text-center">
          <b>Every “hero” was a “zero” at some point.</b>
        </p>
        <p>
          With hard work and continuous effort learning the Mandarin language,
          many have improved tremendously. In this page we showcase some of our
          students that have successfully passed the HSK exams after taking
          courses from us!
        </p>
        <p>
          If you have taken our courses and have passed an HSK test (either an
          official test or a self-test), you can add your name to the scoreboard
          by filling out
          <a href="https://www.chinesezerotohero.com/hoh-submit/">this form</a>.
        </p>
        <div class="text-center mt-5 mb-5 filter">
          <button
            @click="hsk = 'all'"
            class="btn mr-2"
            data-bg-level="outside"
          >
            All
          </button>
          <button
            v-for="level in ['6', '5', '4', '3', '2', '1']"
            @click="hsk = level"
            class="btn mr-2"
            :data-bg-level="level"
          >
            HSK {{ level }}
          </button>
        </div>
        <HeroesList category="hsk" :hsk="hsk" class="mt-5" />
      </div>
    </div>
  </div>
</template>

<script>
import HeroesList from '@/components/HeroesList'

export default {
  data() {
    return {
      hsk: 'all'
    }
  },
  components: {
    HeroesList
  }
}
</script>

<style scoped>
.filter {
  line-height: 3;
}
</style>
