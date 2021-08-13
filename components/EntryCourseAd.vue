<template>
  <!-- ANCHOR img/anchors/learn-this.png -->
  <div>
    <div
      class="container-fluid learn-this-bar"
      v-cloak
      v-if="entry.hsk !== 'outside'"
      style="overflow: visible"
    >
      <div class="container">
        <div class="row">
          <div class="col-sm-12 text-center">
            <a
              :href="`https://courses.chinesezerotohero.com/p/hsk-${entry.hsk}-course`"
            >
              <img
                :src="`/img/courses/hsk${entry.hsk}.jpg`"
                class="course-cover"
              />
            </a>
            <br />
            The word
            <b :data-level="entry.level">“{{ entry.simplified }}”</b>
            is covered in
            <b>
              Unit {{ entry.lesson }}
              <span v-if="entry.hsk < 5">, Text {{ entry.dialog }}</span>
            </b>
            of our HSK {{ entry.hsk }} Video Course.
            <br />
            <a
              :href="`https://courses.chinesezerotohero.com/p/hsk-${entry.hsk}-course`"
              class="btn video-course d-inline-block mt-3"
              :data-bg-level="entry.level"
            >
              <i class="fa fa-check mr-1"></i>
              Take the Course
            </a>
            <router-link
              :to="`/en/zh/hall-of-heroes`"
              class="btn btn-outline-secondary d-inline-block mt-3"
            >
              <i class="fa fa-trophy mr-1"></i>
              See Our Top Students
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- ANCHOR img/anchors/learn-this.png -->
    <div
      class="container-fluid learn-this-bar"
      v-cloak
      v-if="entry.hsk === 'outside'"
    >
      <div class="container">
        <div class="row">
          <div class="col-sm-12 text-center">
            <a href="https://chinesezerotohero.teachable.com/p/path-to-fluency">
              <img src="/img/courses/fluency.jpg" class="course-cover" />
            </a>
            <br />
            Learn how to progress
            <em>beyond the HSK</em>
            toward fluency with our
            <a
              href="https://chinesezerotohero.teachable.com/p/path-to-fluency"
              class="video-course"
            >
              Path to Fluency Video Course
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["entry"],
  data() {
    return {};
  },
};
</script>

<style lang="scss">
.learn-this-bar {
  padding: 1rem 1rem;
  margin-top: 8rem;
  font-size: 1.2rem;
  background: #00000010;
  border-radius: 0.5rem;
  margin-bottom: 0;
  padding-bottom: 2rem;
  a:not(.link-unstyled) {
    font-weight: bold;
  }
  .course-cover {
    box-shadow: 4px 6px 19px #00000091;
    margin-bottom: 2rem;
    border-radius: 1rem;
    max-width: 20rem;
    margin-top: -8rem;
  }
}
</style>