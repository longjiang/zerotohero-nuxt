<template>
  <!-- ANCHOR img/anchors/learn-this.png -->
  <div
    :class="`course-ad course-ad-${variant}`"
    v-cloak
    style="overflow: visible"
  >
    <div v-if="entry.hsk !== 'outside'">
      <div class="text-center">
        <a
          :href="`https://courses.chinesezerotohero.com/p/hsk-${entry.hsk}-course`"
          v-if="variant !== 'compact'"
          class="d-block"
        >
          <img :src="`/img/courses/hsk${entry.hsk}.jpg`" class="course-cover" />
        </a>
        <div>
          This word is covered in
          <b>
            Unit {{ entry.lesson }}
            <span v-if="entry.hsk < 5">, Text {{ entry.dialog }}</span>
          </b>
          of our
          <a
            :href="`https://courses.chinesezerotohero.com/p/hsk-${entry.hsk}-course`"
            :data-level="entry.level"
          >
            HSK {{ entry.hsk }} Video Course.
          </a>
        </div>
        <div class="mt-3" v-if="variant !== 'compact'">
          <a
            :href="`https://courses.chinesezerotohero.com/p/hsk-${entry.hsk}-course`"
            :class="`btn video-course`"
            :data-bg-level="entry.level"
          >
            <i class="fa fa-check mr-1"></i>
            Take the Course
          </a>
          <router-link
            :to="`/en/zh/hall-of-heroes`"
            class="btn btn-outline-secondary"
          >
            <i class="fa fa-trophy mr-1"></i>
            See Our Top Students
          </router-link>
        </div>
      </div>
    </div>
    <div v-if="entry.hsk === 'outside'">
      <div class="text-center">
        <a
          href="https://chinesezerotohero.teachable.com/p/path-to-fluency"
          v-if="variant !== 'compact'"
          class="d-block"
        >
          <img src="/img/courses/fluency.jpg" class="course-cover" />
        </a>
        <div>
          Learn how to progress
          <em>beyond the HSK</em>
          toward fluency with our
          <a
            href="https://chinesezerotohero.teachable.com/p/path-to-fluency"
            class="video-course"
          >
            Path to Fluency Course
          </a>
          .
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    entry: {
      type: Object,
    },
    variant: {
      default: "default", // or 'compact
    },
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss">
.course-ad {
  background: #0000000c;
  border-radius: 0.5rem;
  margin-bottom: 0;
  padding: 1rem;
  &.course-ad-default {
    margin-top: 8rem;
    font-size: 1.2rem;
    padding: 2rem;
  }
  a:not(.link-unstyled) {
    font-weight: bold;
  }
  .course-cover {
    box-shadow: 4px 6px 19px #00000091;
    margin-bottom: 2rem;
    border-radius: 1rem;
    max-width: 15rem;
    margin-top: -8rem;
  }
}
</style>