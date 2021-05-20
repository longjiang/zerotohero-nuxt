<template>
  <!-- ANCHOR img/anchors/learn-this.png -->
  <div id="hey">
    <div
      class="container-fluid learn-this-bar"
      v-cloak
      v-if="entry.hsk !== 'outside'"
    >
      <div class="container">
        <div class="row">
          <div class="col-sm-12 text-center">
            <a
              :href="
                `https://courses.chinesezerotohero.com/p/hsk-${
                  entry.hsk
                }-course`
              "
            >
              <img
                :src="`/img/courses/hsk${entry.hsk}.jpg`"
                class="course-cover"
              />
            </a>
            <br />
            Learn how to use <b :data-level="entry.level">“{{ entry.simplified }}”</b> in
            <b>
              Unit {{ entry.lesson }}
              <span v-if="entry.hsk < 5">, Text {{ entry.dialog }}</span>
            </b>
            of our
            <a
              :href="
                `https://courses.chinesezerotohero.com/p/hsk-${
                  entry.hsk
                }-course`
              "
              class="video-course"
              :data-level="entry.level"
              >HSK {{ entry.hsk }} Video Course</a
            >
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
            <br />Learn how to progress <em>beyond the HSK</em> toward fluency
            with our
            <a
              href="https://chinesezerotohero.teachable.com/p/path-to-fluency"
              class="video-course"
              >Path to Fluency Video Course</a
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['entry'],
  data() {
    return {}
  }
}
</script>

<style lang="scss">
  
.learn-this {
  border-top: 1px solid #e6e6e6;
  border-bottom: 1px solid #e6e6e6;
  padding: 0.3rem;
}

.learn-this-bar {
  padding: 1.5rem 1rem;
  font-size: 1.2rem;
  background: #ccc;
  margin-top: 10rem;
  margin-bottom: 0;
}

.learn-this-bar a {
  font-weight: bold;
  color: #004d81;
}

.course-cover {
  box-shadow: 4px 6px 19px #00000091;
  margin-bottom: 2rem;
  border-radius: 1rem;
  margin-top: -8rem;
  max-width: 20rem;
}

</style>